import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

export const UseAuth = () => {
  return applyDecorators(UseGuards(JwtAuthGuard));
};
