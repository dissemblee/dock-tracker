import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class UpdateReminderDto {
  @IsString({ message: 'Название должно быть строкой' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'Описание должно быть строкой' })
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'Некорректная дата напоминания' })
  @IsOptional()
  remindAt?: string;

  @IsBoolean({ message: 'Должно быть булевым значением' })
  @IsOptional()
  isSent?: boolean;
}
