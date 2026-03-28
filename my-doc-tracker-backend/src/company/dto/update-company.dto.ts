import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCompanyDto {
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название компании обязательно' })
  name: string;
}
