import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { JwtPayload } from './auth.interface';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(
    @Res() res: Response,
    @Body() userCreateDto: Prisma.UserCreateInput,
  ) {
    const [accessToken, refreshToken] =
      await this.authService.register(userCreateDto);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 15 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return res.sendStatus(200);
  }

  @Post('/login')
  @UseGuards(LocalAuthGuard)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
    @Body() { username }: Prisma.UserUpdateInput,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Log in your account');
    }

    const { accessToken, refreshToken } = await this.authService.generateTokens(
      username as string,
      req.user as JwtPayload,
      true,
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 15 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return req.user;
  }

  @Post('/profile')
  @UseGuards(JwtGuard)
  async profile(@Req() req: Request) {
    return req.user;
  }

  @Post('/refresh-tokens')
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() { username }: Prisma.UserUpdateInput,
  ) {
    const { accessToken } = await this.authService.refreshAccessToken(
      username as string,
      req.cookies,
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 15 * 1000,
    });
  }
}
