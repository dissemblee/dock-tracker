import { IsEnum, IsOptional, IsNumber } from 'class-validator';
import { WorkMode } from 'src/user/user.model';

export class UpdateWorkModeDto {
  @IsEnum(WorkMode, {
    message: 'Режим должен быть "personal" или "company"',
  })
  workMode: WorkMode;

  @IsOptional()
  @IsNumber({}, { message: 'activeCompanyId должен быть числом' })
  activeCompanyId?: number | null;
}
