import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/sequelize';
import { CompanyMemberModel } from 'src/company/company-member.model';
import { CompanyMemberRole } from 'src/company/company-member-role.enum';
import { COMPANY_ACCESS_KEY } from './company-access.constants';
import { CompanyAccessOptions } from './company-access.types';

/**
 * Guard для проверки членства пользователя в компании.
 * Проверяет, что пользователь состоит хотя бы в одной компании
 * (запись в company_members существует).
 *
 * Опция requireOwnership: разрешает доступ только owner/admin.
 */
@Injectable()
export class CompanyAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(CompanyMemberModel)
    private companyMemberModel: typeof CompanyMemberModel,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options =
      this.reflector.get<CompanyAccessOptions>(
        COMPANY_ACCESS_KEY,
        context.getHandler(),
      ) ?? {};

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = request.user as { id?: number } | undefined;

    if (!user?.id) {
      throw new ForbiddenException('Пользователь не авторизован');
    }

    // Проверяем, что пользователь является участником хотя бы одной компании
    const membership = await this.companyMemberModel.findOne({
      where: { userId: user.id },
    });

    if (!membership) {
      throw new ForbiddenException(
        'Вы не состоите ни в одной компании. Создайте или присоединитесь к компании.',
      );
    }

    // Если требуется владение (owner/admin)
    if (options.requireOwnership) {
      if (
        membership.role !== CompanyMemberRole.OWNER &&
        membership.role !== CompanyMemberRole.ADMIN
      ) {
        throw new ForbiddenException(
          'Только владелец или администратор компании может выполнять это действие',
        );
      }
    }

    return true;
  }
}
