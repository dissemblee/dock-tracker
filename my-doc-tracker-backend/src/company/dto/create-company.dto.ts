import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название компании обязательно' })
  name: string;
}
