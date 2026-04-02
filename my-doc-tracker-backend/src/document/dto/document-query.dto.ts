import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

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
}
