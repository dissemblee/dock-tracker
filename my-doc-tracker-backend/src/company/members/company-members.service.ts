import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { CompanyService } from '../company.service';
import { UserService } from 'src/user/user.service';
import { CompanyModel } from '../company.model';
import { UserModel } from 'src/user/user.model';
import { UserRole } from 'src/user/dto/user-role.enum';

@Injectable()
export class CompanyMembersService {
  constructor(
    private companyService: CompanyService,
    private userService: UserService,
  ) {}

  async getMembers(companyId: number): Promise<UserModel[]> {
    const company = await this.companyService.getMembers(companyId);
    return company.users || [];
  }

  async inviteMember(
    companyId: number,
    email: string,
    inviterId: number,
  ): Promise<{ message: string; user: UserModel }> {
    const inviter = await this.userService.findOne(inviterId);

    if (!inviter) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (inviter.companyId !== companyId) {
      throw new ForbiddenException('Вы не являетесь участником этой компании');
    }

    if (inviter.role !== 'ADMIN') {
      throw new ForbiddenException('Только ADMIN может приглашать участников');
    }

    const userToInvite = await this.userService.findByEmail(email);

    if (!userToInvite) {
      throw new NotFoundException('Пользователь с таким email не найден');
    }

    if (userToInvite.companyId === companyId) {
      throw new ConflictException('Пользователь уже является участником этой компании');
    }

    if (userToInvite.companyId !== null && userToInvite.companyId !== companyId) {
      throw new ConflictException('Пользователь уже является участником другой компании');
    }

    await this.userService.update(userToInvite.id, {
      companyId,
      role: UserRole.MEMBER,
    });

    return {
      message: 'Пользователь успешно добавлен в компанию',
      user: userToInvite,
    };
  }

  async removeMember(
    companyId: number,
    userId: number,
    removerId: number,
  ): Promise<{ message: string }> {
    const remover = await this.userService.findOne(removerId);

    if (!remover) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (remover.companyId !== companyId) {
      throw new ForbiddenException('Вы не являетесь участником этой компании');
    }

    if (remover.role !== 'ADMIN') {
      throw new ForbiddenException('Только ADMIN может удалять участников');
    }

    if (userId === removerId) {
      throw new ForbiddenException('Нельзя удалить самого себя');
    }

    const userToRemove = await this.userService.findOne(userId);

    if (!userToRemove) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (userToRemove.companyId !== companyId) {
      throw new ConflictException('Пользователь не является участником этой компании');
    }

    await this.userService.update(userId, {
      companyId: null,
      role: UserRole.NO_ROLE,
    });

    return {
      message: 'Пользователь успешно удалён из компании',
    };
  }
}
