import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('username-check')
  async checkUsername(@Query('username') username: string) {
    return await this.usersService.checkUsername(username);
  }

  @Get('me')
  getMe(email: string) {
    return this.usersService.findOneByEmailWithPassword(email);
  }

  @Get(':id')
  findById(@Param(':id') id: string) {
    return this.usersService.findOneById(id);
  }
}
