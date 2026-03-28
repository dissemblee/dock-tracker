import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  MaxLength,
  IsDate,
} from 'class-validator';

export class CreateDocumentDto {
  @IsNotEmpty({ message: 'Название документа обязательно' })
  @IsString({ message: 'Название документа должно быть строкой' })
  @MinLength(3, { message: 'Минимальная длина названия документа 3 символа' })
  @MaxLength(100, { message: 'Слишком длинное название документа' })
  title: string;

  @IsDate({ message: 'Некорректная дата истечения срока действия' })
  @IsNotEmpty({ message: 'Дата истечения срока действия обязательна' })
  expiresAt: Date;

  @IsNotEmpty({ message: 'Количество дней уведомления обязательно' })
  @IsNumber({}, { message: 'Количество дней уведомления должно быть числом' })
  notifyBefore: number;
}
