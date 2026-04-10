import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { RegisterDto } from './auth.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, user } = await this.authService.login(dto);

    res.cookie('jwt', accessToken, {
      httpOnly: false,
      secure: false,
      maxAge: 900000,
      sameSite: 'lax',
      path: '/',
    });

    if (process.env.NODE_ENV !== 'production') {
      return {
        message: 'Успешный вход',
        user,
        accessToken, 
      };
    }

    return { message: 'Успешный вход', user };
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, user } = await this.authService.register(dto);

    res.cookie('jwt', accessToken, {
      httpOnly: false, 
      secure: false,
      maxAge: 900000,
      sameSite: 'lax',
      path: '/',
    });

    if (process.env.NODE_ENV !== 'production') {
      return {
        message: 'Регистрация успешна',
        user,
        accessToken, 
      };
    }

    return { message: 'Регистрация успешна', user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt', { path: '/' });
    return { message: 'Выход выполнен' };
  }
}
