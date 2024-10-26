import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('')
  getAll() {
    return this.usersService.findAll();
  }

  @Get(':username')
  getOne(@Param('username') username: string) {
    return this.usersService.findOne(username);
  }
}
