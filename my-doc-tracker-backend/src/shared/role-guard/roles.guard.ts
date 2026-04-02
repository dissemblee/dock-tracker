import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<string>(
      'role',
      context.getHandler(),
    );
    if (!requiredRole) return true;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = context.switchToHttp().getRequest().user as
      | { role?: string }
      | undefined;

    if (!user) throw new ForbiddenException('Пользователь не авторизован');

    if (user.role === 'NO_ROLE') {
      throw new ForbiddenException('У вас нет роли. Обратитесь к администратору.');
    }

    if (user.role !== requiredRole) {
      throw new ForbiddenException('Нет доступа для вашей роли');
    }

    return true;
  }
}
