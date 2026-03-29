import { Body, Controller, Headers, Logger, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import type { Env } from '../../common/config/env.schema';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private config: ConfigService<Env>,
  ) {}

  private readonly logger = new Logger(AuthController.name, { timestamp: true });

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Headers('user-agent') userAgent: string = 'unknown',
    @Headers('x-client-platform') clientPlatform: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, expiresAt } = await this.authService.register(
      dto,
      userAgent,
    );
    return this.buildResponse({ accessToken, refreshToken, expiresAt }, clientPlatform, req, res);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Headers('user-agent') userAgent: string = 'unknown',
    @Headers('x-client-platform') clientPlatform: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, expiresAt } = await this.authService.login(dto, userAgent);
    return this.buildResponse({ accessToken, refreshToken, expiresAt }, clientPlatform, req, res);
  }

  private buildResponse(
    tokens: { accessToken: string; refreshToken: string; expiresAt: Date },
    clientPlatform: string,
    req: Request,
    res: Response,
  ) {
    const platformKey = this.config.get('MOBILE_HEADER', { infer: true });
    const isMobile = clientPlatform === platformKey;

    if (isMobile) {
      this.logger.log(
        `Mobile auth | IP: ${req.ip} | UA: ${req.headers['user-agent']} | URL: ${req.url}`,
      );
      return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
    }

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV', { infer: true }) === 'production',
      sameSite: 'lax',
      expires: tokens.expiresAt,
    });

    return { accessToken: tokens.accessToken };
  }
}
