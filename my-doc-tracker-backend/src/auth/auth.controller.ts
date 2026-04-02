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

    // Устанавливаем cookie
    res.cookie('jwt', accessToken, {
      httpOnly: false, // Разрешаем чтение из JS (для dev)
      secure: false, // Отключаем для HTTP (в production нужен HTTPS)
      maxAge: 900000, // 15 минут
      sameSite: 'lax',
      path: '/',
    });

    // В development возвращаем токен также в JSON для отладки
    if (process.env.NODE_ENV !== 'production') {
      return {
        message: 'Успешный вход',
        user,
        accessToken, // Только для dev!
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

    // Устанавливаем cookie
    res.cookie('jwt', accessToken, {
      httpOnly: false, // Разрешаем чтение из JS (для dev)
      secure: false, // Отключаем для HTTP (в production нужен HTTPS)
      maxAge: 900000, // 15 минут
      sameSite: 'lax',
      path: '/',
    });

    // В development возвращаем токен также в JSON для отладки
    if (process.env.NODE_ENV !== 'production') {
      return {
        message: 'Регистрация успешна',
        user,
        accessToken, // Только для dev!
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
