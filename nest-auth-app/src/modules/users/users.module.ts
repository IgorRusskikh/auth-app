import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
})
export class UsersModule {}
