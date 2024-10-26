import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.user.findMany();
  }

  async findOne(username: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(userCreateDto: Prisma.UserCreateInput) {
    const existsUser = await this.prismaService.user.findMany({
      where: {
        username: userCreateDto.username,
        email: userCreateDto.email,
      },
    });

    if (existsUser.length) {
      throw new ConflictException('User already exists');
    }

    const user = await this.prismaService.user.create({
      data: userCreateDto,
    });

    return user;
  }

  async update(username: string, UpdateUserDto: Prisma.UserUpdateInput) {
    try {
      const updatedUser = await this.prismaService.user.update({
        where: {
          username,
        },
        data: UpdateUserDto,
      });

      console.log(updatedUser);

      return updatedUser;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error while update user');
    }
  }
}
