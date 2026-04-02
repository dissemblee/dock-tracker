import { IsNotEmpty, IsString, IsOptional, Length } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString({ message: 'Название должно быть строкой' })
  @Length(2, 100, { message: 'Название компании должно быть от 2 до 100 символов' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'ИНН должно быть строкой' })
  @Length(10, 15, { message: 'ИНН должно содержать от 10 до 15 символов' })
  inn?: string;
}
