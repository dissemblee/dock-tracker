import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateReminderDto {
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно' })
  title: string;

  @IsString({ message: 'Описание должно быть строкой' })
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'Некорректная дата напоминания' })
  @IsNotEmpty({ message: 'Дата напоминания обязательна' })
  remindAt: string;

  @IsOptional()
  documentId?: number;
}
