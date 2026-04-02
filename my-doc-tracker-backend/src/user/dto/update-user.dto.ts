import { IsEmail, IsOptional, IsString, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @Transform(({ value }) => value === null ? null : parseInt(value, 10))
  @IsInt()
  companyId?: number | null;
}
