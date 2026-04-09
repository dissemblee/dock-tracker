import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { CompanyAccessOptions } from './company-access.types';
import { COMPANY_ACCESS_KEY } from './company-access.constants';
import { CompanyAccessGuard } from './company-access.guard';

/**
 * Декоратор для проверки членства пользователя в компании.
 * Автоматически применяет JwtAuthGuard + CompanyAccessGuard.
 *
 * @param options - опции:
 *   - requireOwnership: true — разрешить только owner/admin
 *
 * @example
 * @CompanyAccess()           — любой участник компании
 * @CompanyAccess({ requireOwnership: true }) — только owner/admin
 */
export const CompanyAccess = (options?: CompanyAccessOptions) => {
  return applyDecorators(
    SetMetadata(COMPANY_ACCESS_KEY, options ?? {}),
    UseGuards(JwtAuthGuard, CompanyAccessGuard),
  );
};

export { COMPANY_ACCESS_KEY };
