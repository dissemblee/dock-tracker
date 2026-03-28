import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
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

  @IsString({ message: 'Роль должна быть строкой' })
  @IsNotEmpty({ message: 'Роль обязательна' })
  role: string;
}
