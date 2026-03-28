import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @Transform(({ value }) => (value as string).toLowerCase().trim())
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(6, { message: 'Минимальная длина пароля 6 символов' })
  @MaxLength(100, { message: 'Слишком длинный пароль' })
  password: string;
}

export class RegisterDto {
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя обязательно' })
  @MinLength(2, { message: 'Минимальная длина имени 2 символа' })
  @MaxLength(50, { message: 'Максимальная длина имени 50 символов' })
  name: string;

  @Transform(({ value }) => (value as string).toLowerCase().trim())
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(6, { message: 'Минимальная длина пароля 6 символов' })
  @MaxLength(100, { message: 'Слишком длинный пароль' })
  password: string;
}

export class AuthDto {
  @Transform(({ value }) => (value as string).toLowerCase().trim())
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(6, { message: 'Минимальная длина пароля 6 символов' })
  @MaxLength(100, { message: 'Слишком длинный пароль' })
  password: string;
}
