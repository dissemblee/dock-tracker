import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";

export class CreateUserDto {
  @Transform(({ value }) => value.toLowerCase().trim())
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(6, { message: 'Минимальная длина пароля 6 символов' })
  @MaxLength(100, { message: 'Слишком длинный пароль' })
  password: string;
}
