import { IsNotEmpty, IsString, IsOptional, Length, IsEmail } from 'class-validator';

export class CreateCompanyDto {
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название компании обязательно' })
  @Length(2, 100, { message: 'Название компании должно быть от 2 до 100 символов' })
  name: string;

  @IsOptional()
  @IsString({ message: 'ИНН должно быть строкой' })
  @Length(10, 15, { message: 'ИНН должно содержать от 10 до 15 символов' })
  inn?: string;

  /** Основной государственный регистрационный номер */
  @IsOptional()
  @IsString({ message: 'ОГРН должно быть строкой' })
  @Length(13, 15, { message: 'ОГРН должно содержать 13-15 символов' })
  ogrn?: string;

  /** Юридический адрес */
  @IsOptional()
  @IsString({ message: 'Адрес должен быть строкой' })
  address?: string;

  /** Телефон компании */
  @IsOptional()
  @IsString({ message: 'Телефон должен быть строкой' })
  phone?: string;

  /** Email компании */
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email компании' })
  email?: string;

  /** Сайт компании */
  @IsOptional()
  @IsString({ message: 'Сайт должен быть строкой' })
  website?: string;

  /** Ключ логотипа в S3 (загружается отдельно) */
  @IsOptional()
  @IsString({ message: 'Ключ логотипа должен быть строкой' })
  logoKey?: string;
}
