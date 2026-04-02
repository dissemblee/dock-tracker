import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  MaxLength,
  IsISO8601,
} from 'class-validator';

export class CreateDocumentDto {
  @IsNotEmpty({ message: 'Название документа обязательно' })
  @IsString({ message: 'Название документа должно быть строкой' })
  @MinLength(3, { message: 'Минимальная длина названия документа 3 символа' })
  @MaxLength(100, { message: 'Слишком длинное название документа' })
  title: string;

  @IsNotEmpty({ message: 'Дата истечения срока действия обязательна' })
  @IsString({ message: 'Дата должна быть строкой' })
  @IsISO8601()
  expiresAt: string;

  @IsNotEmpty({ message: 'Количество дней уведомления обязательно' })
  @IsNumber({}, { message: 'Количество дней уведомления должно быть числом' })
  notifyBefore: number;
}
