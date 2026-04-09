import { IsNotEmpty, IsString, IsOptional, Length, IsEmail } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString({ message: 'Название должно быть строкой' })
  @Length(2, 100, { message: 'Название компании должно быть от 2 до 100 символов' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'ИНН должно быть строкой' })
  @Length(10, 15, { message: 'ИНН должно содержать от 10 до 15 символов' })
  inn?: string;

  @IsOptional()
  @IsString({ message: 'ОГРН должно быть строкой' })
  @Length(13, 15, { message: 'ОГРН должно содержать 13-15 символов' })
  ogrn?: string;

  @IsOptional()
  @IsString({ message: 'Адрес должен быть строкой' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Телефон должен быть строкой' })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email компании' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Сайт должен быть строкой' })
  website?: string;

  @IsOptional()
  @IsString({ message: 'Ключ логотипа должен быть строкой' })
  logoKey?: string;
}
