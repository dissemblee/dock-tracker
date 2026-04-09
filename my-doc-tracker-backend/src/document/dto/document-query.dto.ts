import { IsOptional, IsInt, Min, IsString, IsIn, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

/** Режим фильтрации документов */
export type DocumentMode = 'personal' | 'company';

export class DocumentQueryDto {
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  sortBy?: 'title' | 'expiresAt' | 'uploadedAt' | 'createdAt' = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsIn(['ACTIVE', 'EXPIRING', 'EXPIRED'])
  status?: 'ACTIVE' | 'EXPIRING' | 'EXPIRED';

  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Режим фильтрации:
   * - personal — только личные документы пользователя
   * - company — документы компании (все или конкретного сотрудника)
   */
  @IsOptional()
  @IsEnum(['personal', 'company'])
  mode?: DocumentMode;

  /** ID компании (для mode=company) */
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsInt()
  @Min(1)
  companyId?: number;

  /** ID владельца/сотрудника (для mode=company — фильтрация по сотруднику) */
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsInt()
  @Min(1)
  ownerId?: number;

  /** Фильтр: только общие документы компании */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isCompanyDocument?: boolean;
}
