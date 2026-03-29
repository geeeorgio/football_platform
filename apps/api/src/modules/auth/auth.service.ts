import { createHash } from 'node:crypto';

import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import type { Env } from '../../common/config/env.schema';
import { ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from '../../common/constants/auth.constants';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService<Env>,
    private prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto, userAgent: string) {
    const existingUser = await this.userService.findOneByEmailWithPassword(dto.email);

    if (existingUser) throw new ConflictException('Email already taken');

    const existingusername = await this.userService.checkUsername(dto.username);

    if (existingusername) throw new ConflictException('Username already taken');

    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const newUser = await this.userService.createUser({
        email: dto.email,
        username: dto.username,
        passwordHash: hashedPassword,
      });

      return await this.issueTokens(newUser.id, userAgent);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && 'code' in e && e.code === 'P2002') {
        throw new ConflictException('Email or username is already taken');
      }

      throw e;
    }
  }

  async login(dto: LoginDto, userAgent: string) {
    const user = await this.userService.findOneByEmailWithPassword(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMath = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMath) throw new UnauthorizedException('Invalid credentials');

    return await this.issueTokens(user.id, userAgent);
  }

  private async issueTokens(userId: string, userAgent: string) {
    const { accessToken, refreshToken } = await this.generateJwt(userId);
    const expiresAt = await this.createSession(userId, refreshToken, userAgent);

    return { accessToken, refreshToken, expiresAt };
  }

  private async generateJwt(userId: string) {
    const accessKey = this.config.get('JWT_ACCESS', { infer: true });
    const refreshKey = this.config.get('JWT_REFRESH', { infer: true });

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId },
        { secret: accessKey, expiresIn: ACCESS_TOKEN_EXPIRES },
      ),
      this.jwtService.signAsync(
        { sub: userId },
        { secret: refreshKey, expiresIn: REFRESH_TOKEN_EXPIRES },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async createSession(userId: string, token: string, userAgent: string) {
    const hashedToken = createHash('sha256').update(token).digest('hex');
    const payload = this.jwtService.decode(token) as { exp: number };
    const expiresAt = new Date(payload.exp * 1000);
    const agent = userAgent || 'unknown';

    await this.prisma.session.upsert({
      where: {
        userId_userAgent: { userId, userAgent: agent },
      },
      update: {
        hashedToken,
        expiresAt,
      },
      create: {
        userId,
        userAgent: agent,
        hashedToken,
        expiresAt,
      },
    });

    const count = await this.prisma.session.count({ where: { userId } });
    if (count > 9) {
      const oldest = await this.prisma.session.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      if (oldest) {
        await this.prisma.session.delete({
          where: { id: oldest.id },
        });
      }
    }

    return expiresAt;
  }
}
