import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import type { Env } from '../../common/config/env.schema';
import { ACCESS_TOKEN_EXPIRES } from '../../common/constants/auth.constants';
import { UsersModule } from '../users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env>) => ({
        secret: config.get('JWT_ACCESS', { infer: true }),
        signOptions: { expiresIn: ACCESS_TOKEN_EXPIRES },
      }),
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
