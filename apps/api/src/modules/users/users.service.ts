import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOneByEmailWithPassword(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOneByEmailOmitPassword(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      omit: { passwordHash: true },
    });
  }

  async findOneById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      omit: { passwordHash: true },
    });
  }

  async createUser(data: { email: string; passwordHash: string; username: string }) {
    return await this.prisma.user.create({
      data,
      omit: { passwordHash: true },
    });
  }

  async checkUsername(username: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    return Boolean(user);
  }
}
