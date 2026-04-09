import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { BaseService } from 'src/shared/base/base.service';
import { CompanyModel } from './company.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UserService } from 'src/user/user.service';
import { UserRole } from 'src/user/dto/user-role.enum';
import { UserModel, WorkMode } from 'src/user/user.model';
import { Op } from 'sequelize';
import { CompanyMemberModel } from './company-member.model';
import { CompanyMemberRole } from './company-member-role.enum';

@Injectable()
export class CompanyService extends BaseService<CompanyModel> {
  constructor(
    @InjectModel(CompanyModel) private companyModel: typeof CompanyModel,
    @InjectModel(CompanyMemberModel)
    private companyMemberModel: typeof CompanyMemberModel,
    private userService: UserService,
  ) {
    super(companyModel);
  }

  async createWithUser(
    dto: CreateCompanyDto,
    userId: number,
  ): Promise<CompanyModel> {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Пользователь уже в компании
    if (user.companyId) {
      throw new ConflictException(
        'Вы уже состоите в компании. Покиньте текущую компанию перед созданием новой.',
      );
    }

    if (dto.inn) {
      const existingCompanyWithInn = await this.companyModel.findOne({
        where: { inn: dto.inn },
      });

      if (existingCompanyWithInn) {
        throw new ConflictException('Компания с таким ИНН уже существует');
      }
    }

    const existingCompanyWithName = await this.companyModel.findOne({
      where: { name: dto.name },
    });

    if (existingCompanyWithName) {
      throw new ConflictException('Компания с таким названием уже существует');
    }

    const company = await this.create(dto as any);

    if (!company) {
      throw new NotFoundException('Компания не создана');
    }

    // Привязываем пользователя как владельца (через CompanyMember + updateUser)
    await this.userService.update(userId, {
      companyId: company.id,
      role: UserRole.ADMIN,
      workMode: WorkMode.COMPANY,
      activeCompanyId: company.id,
    });

    await this.companyMemberModel.create({
      userId,
      companyId: company.id,
      role: CompanyMemberRole.OWNER,
      invitedAt: new Date(),
      acceptedAt: new Date(),
    });

    return company;
  }

  /**
   * Получить компании, в которых состоит пользователь
   */
  async getUserCompanies(userId: number): Promise<CompanyModel[]> {
    const memberships = await this.companyMemberModel.findAll({
      where: { userId },
      include: [CompanyModel],
    });

    return memberships.map((m) => m.company);
  }

  /**
   * Получить информацию о компании с участниками
   */
  async getCompanyWithMembers(companyId: number): Promise<CompanyModel> {
    const company = await this.companyModel.findByPk(companyId, {
      include: [UserModel],
    });

    if (!company) {
      throw new NotFoundException('Компания не найдена');
    }

    return company;
  }

  /**
   * Получить список сотрудников компании (через company_members)
   */
  async getCompanyMembers(
    companyId: number,
  ): Promise<CompanyMemberModel[]> {
    const company = await this.companyModel.findByPk(companyId);
    if (!company) {
      throw new NotFoundException('Компания не найдена');
    }

    const members = await this.companyMemberModel.findAll({
      where: { companyId },
      include: [UserModel],
      order: [['createdAt', 'ASC']],
    });

    return members;
  }

  /**
   * Пригласить пользователя в компанию по email.
   * Если пользователь не найден — создаём запись с inviteEmail.
   */
  async inviteMember(
    companyId: number,
    email: string,
    inviterId: number,
  ): Promise<{ message: string; member?: CompanyMemberModel }> {
    const inviter = await this.userService.findOne(inviterId);
    if (!inviter) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверяем, что приглашающий — владелец или админ
    const inviterMembership = await this.companyMemberModel.findOne({
      where: { userId: inviterId, companyId },
    });

    if (!inviterMembership) {
      throw new BadRequestException('Вы не состоите в этой компании');
    }

    if (
      inviterMembership.role !== CompanyMemberRole.OWNER &&
      inviterMembership.role !== CompanyMemberRole.ADMIN
    ) {
      throw new BadRequestException(
        'Только владелец или администратор может приглашать',
      );
    }

    // Проверяем, нет ли уже приглашения с таким email
    const existingInvite = await this.companyMemberModel.findOne({
      where: { companyId, inviteEmail: email },
    });

    if (existingInvite) {
      throw new ConflictException(
        'Пользователь с таким email уже приглашён или состоит в компании',
      );
    }

    // Ищем пользователя по email
    const targetUser = await this.userService.findByEmail(email);

    if (targetUser) {
      // Пользователь существует — проверяем, не в компании ли он уже
      if (targetUser.companyId === companyId) {
        throw new ConflictException('Пользователь уже состоит в этой компании');
      }

      if (targetUser.companyId) {
        throw new ConflictException(
          'Пользователь уже состоит в другой компании',
        );
      }

      // Создаём членство
      const member = await this.companyMemberModel.create({
        userId: targetUser.id,
        companyId,
        role: CompanyMemberRole.MEMBER,
        invitedAt: new Date(),
        acceptedAt: new Date(),
      });

      return { message: 'Пользователь приглашён в компанию', member };
    }

    // Пользователь не найден — создаём "ожидающее" приглашение
    const pendingInvite = await this.companyMemberModel.create({
      companyId,
      inviteEmail: email,
      role: CompanyMemberRole.MEMBER,
      invitedAt: new Date(),
      // userId = 0 — placeholder, будет заполнен при регистрации
    } as any);

    return {
      message: `Приглашение отправлено на ${email}. Пользователь получит доступ после регистрации.`,
      member: pendingInvite,
    };
  }

  /**
   * Принять приглашение (для зарегистрированного пользователя)
   */
  async acceptInvite(userId: number, companyId: number): Promise<CompanyMemberModel> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Ищем.pending приглашение по email
    const invite = await this.companyMemberModel.findOne({
      where: { companyId, inviteEmail: user.email },
    });

    if (!invite) {
      throw new NotFoundException('Приглашение не найдено');
    }

    if (invite.userId && invite.userId !== userId) {
      throw new ConflictException('Приглашение предназначено другому пользователю');
    }

    // Обновляем приглашение
    await invite.update({
      userId,
      acceptedAt: new Date(),
      inviteEmail: null,
    });

    // Обновляем пользователя
    await this.userService.update(userId, {
      companyId,
      role: UserRole.MEMBER,
      workMode: WorkMode.COMPANY,
      activeCompanyId: companyId,
    });

    return invite;
  }

  /**
   * Удалить участника из компании
   */
  async removeMember(
    companyId: number,
    userId: number,
    removerId: number,
  ): Promise<{ message: string }> {
    const removerMembership = await this.companyMemberModel.findOne({
      where: { userId: removerId, companyId },
    });

    if (!removerMembership) {
      throw new BadRequestException('Вы не состоите в этой компании');
    }

    if (
      removerMembership.role !== CompanyMemberRole.OWNER &&
      removerMembership.role !== CompanyMemberRole.ADMIN
    ) {
      throw new BadRequestException(
        'Только владелец или администратор может удалять участников',
      );
    }

    if (userId === removerId) {
      throw new BadRequestException('Нельзя удалить самого себя');
    }

    const targetMembership = await this.companyMemberModel.findOne({
      where: { userId, companyId },
    });

    if (!targetMembership) {
      throw new NotFoundException('Участник не найден в компании');
    }

    // Нельзя удалить владельца
    if (targetMembership.role === CompanyMemberRole.OWNER) {
      throw new BadRequestException('Нельзя удалить владельца компании');
    }

    await targetMembership.destroy();

    // Обновляем пользователя
    const user = await this.userService.findOne(userId);
    if (user && user.companyId === companyId) {
      await this.userService.update(userId, {
        companyId: null,
        role: UserRole.NO_ROLE,
        workMode: WorkMode.PERSONAL,
        activeCompanyId: null,
      });
    }

    return { message: 'Участник успешно удалён из компании' };
  }

  /**
   * Покинуть компанию
   */
  async leaveCompany(userId: number): Promise<{ message: string }> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (!user.companyId) {
      throw new BadRequestException('Вы не состоите в компании');
    }

    const membership = await this.companyMemberModel.findOne({
      where: { userId },
    });

    if (!membership) {
      throw new NotFoundException('Членство в компании не найдено');
    }

    if (membership.role === CompanyMemberRole.OWNER) {
      throw new BadRequestException(
        'Владелец не может покинуть компанию. Передайте владение другому участнику.',
      );
    }

    await membership.destroy();

    await this.userService.update(userId, {
      companyId: null,
      role: UserRole.NO_ROLE,
      workMode: WorkMode.PERSONAL,
      activeCompanyId: null,
    });

    return { message: 'Вы покинули компанию' };
  }

  async switchRoleToAdmin(
    companyId: number,
    userId: number,
  ): Promise<CompanyModel> {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const company = await this.findOne(companyId);

    if (!company) {
      throw new NotFoundException('Компания не найдена');
    }

    await this.userService.update(userId, { role: UserRole.ADMIN });

    return company;
  }

  async addToCompany(companyId: number, userId: number): Promise<CompanyModel> {
    const company = await this.findOne(companyId);
    const user = await this.userService.findOne(userId);

    if (!company) {
      throw new NotFoundException('Компания не найдена');
    }

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const userExists = company.users?.some((u) => u.id === userId);
    if (userExists) {
      return company;
    }

    if (!company.users) {
      company.users = [];
    }

    await company.$add('users', user);

    return company;
  }

  async deleteToCompany(
    companyId: number,
    userId: number,
  ): Promise<CompanyModel> {
    const company = await this.findOne(companyId);
    const user = await this.userService.findOne(userId);

    if (!company) {
      throw new NotFoundException('Компания не найдена');
    }

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (!company.users) {
      company.users = [];
    }

    await company.$remove('users', user);

    return company;
  }

  async getMembers(companyId: number): Promise<CompanyModel> {
    const companyMembers = await this.companyModel.findByPk(companyId, {
      include: [UserModel],
    });

    if (!companyMembers) {
      throw new NotFoundException('Компания не найдена');
    }

    return companyMembers;
  }

  async update(id: number, dto: Partial<CreateCompanyDto>): Promise<CompanyModel> {
    const company = await this.findOne(id);

    if (!company) {
      throw new NotFoundException('Компания не найдена');
    }

    if (dto.inn && dto.inn !== company.inn) {
      const existingCompanyWithInn = await this.companyModel.findOne({
        where: {
          inn: dto.inn,
          id: { [Op.ne]: id },
        },
      });

      if (existingCompanyWithInn) {
        throw new ConflictException('Компания с таким ИНН уже существует');
      }
    }

    if (dto.name && dto.name !== company.name) {
      const existingCompanyWithName = await this.companyModel.findOne({
        where: {
          name: dto.name,
          id: { [Op.ne]: id },
        },
      });

      if (existingCompanyWithName) {
        throw new ConflictException('Компания с таким названием уже существует');
      }
    }

    await company.update(dto);

    return company;
  }
}
