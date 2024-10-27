import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
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

    const { accessToken, refreshToken } = await this.generateTokens(
      username,
      payload,
    );

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
      if (!(await argon2.verify(passwordHash, password))) {
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
    username: string,
    payload: JwtPayload,
    refresh?: boolean,
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    if (!payload) {
      throw new BadRequestException('Check your data');
    }

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    if (refresh) {
      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      });

      await this.usersService.update(username, {
        refreshToken,
      });

      return { accessToken, refreshToken };
    }

    return { accessToken };
  }

  async refreshAccessToken(username: string, cookies: any) {
    if (!username) {
      throw new BadRequestException('Check your data');
    }

    if (!cookies['refreshToken']) {
      throw new UnauthorizedException('Log in your account');
    }

    console.log(cookies['refreshToken'] + '\n\n');

    const { id, refreshToken } = await this.usersService.findOne(username);

    if (refreshToken !== cookies['refreshToken']) {
      throw new UnauthorizedException('Log in your account');
    }

    const payload = {
      sub: id,
      username: username,
    };

    try {
      const isValid = await this.jwtService.verifyAsync(refreshToken);

      if (isValid) {
        const { accessToken } = await this.generateTokens(username, payload);
        return { accessToken, refreshToken };
      } else {
        throw new UnauthorizedException('Invalid token');
      }
    } catch (err) {
      console.log('Ошибка верификации:', err);
      throw new UnauthorizedException('Log in your account');
    }

    // const { accessToken, refreshToken: newRefreshToken } =
    //   await this.generateTokens(payload);

    // await this.usersService.update(username, {
    //   refreshToken: newRefreshToken,
    // });
  }
}

// `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Iklnb3IgUnVzc2toMiIsImlhdCI6MTcyOTg5NTc3NiwiZXhwIjoxNzMwNTAwNTc2fQ.tMuKXFhoIsIt-9WxV6tnOP4fVV2YG3m0rZPrqrhQdW8`;
