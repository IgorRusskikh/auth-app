import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(user: Prisma.UserCreateInput) {
    const { id, username, password } = user;
    const passwordHash = await argon2.hash(password);

    await this.usersService.create({ ...user, password: passwordHash });
    const payload = {
      sub: id,
      username: username,
    };

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    const updatedUser = await this.usersService.update(username, {
      refreshToken,
    });

    return [accessToken, refreshToken];
  }

  async validateUser(
    username: string,
    password: string,
  ): Promise<{ id: string; username: string }> {
    const { id, password: passwordHash } =
      await this.usersService.findOne(username);

    try {
      if (!argon2.verify(passwordHash, password)) {
        return null;
      }
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }

    return { id, username };
  }

  async validateToken(accessToken: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync(accessToken);
      const user = await this.usersService.findOne(payload.username);
      return user ? { sub: user.id, username: user.username } : null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async generateTokens(
    payload: JwtPayload,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(username: string) {
    const { id, refreshToken } = await this.usersService.findOne(username);
    const payload = {
      sub: id,
      username: username,
    };

    if (await this.jwtService.verifyAsync(refreshToken)) {
      const { accessToken } = await this.generateTokens(payload);
      return { accessToken, refreshToken: refreshToken };
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(payload);

    await this.usersService.update(username, {
      refreshToken: newRefreshToken,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }
}
