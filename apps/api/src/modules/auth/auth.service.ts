import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import type { Env } from '../../common/config/env.schema';
import { ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from '../../common/constants/auth.constants';
import { Prisma } from '../../generated/prisma/client';
import { UsersService } from '../users/users.service';

import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService<Env>,
  ) {}

  async register(dto: RegisterDto) {
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

      const accessKey = this.config.get('JWT_ACCESS', { infer: true });
      const refreshKey = this.config.get('JWT_REFRESH', { infer: true });

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
          { sub: newUser.id },
          { secret: accessKey, expiresIn: ACCESS_TOKEN_EXPIRES },
        ),
        this.jwtService.signAsync(
          { sub: newUser.id },
          { secret: refreshKey, expiresIn: REFRESH_TOKEN_EXPIRES },
        ),
      ]);

      return { accessToken, refreshToken };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && 'code' in e && e.code === 'P2002') {
        throw new ConflictException('Email or username is already taken');
      }

      throw e;
    }
  }
}
