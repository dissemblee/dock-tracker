import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';

export const Role = (role: 'admin' | 'member') => {
  return applyDecorators(
    SetMetadata('role', role),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
};
