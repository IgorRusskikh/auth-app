import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
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
    @Res() res: Response,
    @Body() { username }: Prisma.UserUpdateInput,
  ) {
    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      username as string,
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

    return res.json({
      message: 'You successfully loged in',
      status: 200,
    });
  }

  @Post('/profile')
  @UseGuards(JwtGuard)
  async profile(@Req() req: Request) {
    return req.user;
  }
}
