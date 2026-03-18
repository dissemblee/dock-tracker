import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from 'src/shared/base/base.service';
import { CompanyModel } from './company.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UserService } from 'src/user/user.service';
import { UserRole } from 'src/user/dto/user-role.enum';
import { UserModel } from 'src/user/user.model';
import { Transaction, where } from 'sequelize';

@Injectable()
export class CompanyService extends BaseService<CompanyModel>{
  constructor(
    @InjectModel(CompanyModel) private companyModel: typeof CompanyModel,
    private userService: UserService
  ) {
    super(companyModel);
  }

  async createWithUser (dto: CreateCompanyDto, userId: number): Promise<CompanyModel> {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    const company = await this.create(dto as any);

    if(!company) {
      throw new NotFoundException("Компания не создана");
    }

    await this.userService.update(userId, { companyId: company.id, role: UserRole.ADMIN });

    return company;
  }

  async switchRoleToAdmin (companyId: number, userId: number): Promise<CompanyModel> {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    const company = await this.findOne(companyId);

    if(!company) {
      throw new NotFoundException("Компания не найдена");
    }

    await this.userService.update(userId, { role: UserRole.ADMIN });

    return company;
  }

  async addToCompany(companyId: number, userId: number): Promise<CompanyModel> {
    const company = await this.findOne(companyId);
    const user = await this.userService.findOne(userId);

    if (!company) {
      throw new NotFoundException("Компания не найдена");
    }

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    const userExists = company.users?.some(u => u.id === userId);
    if (userExists) {
      return company;
    }

    if (!company.users) {
      company.users = [];
    }

    await company.$add('users', user);

    return company;
  }

  async deleteToCompany(companyId: number, userId: number): Promise<CompanyModel> {
    const company = await this.findOne(companyId);
    const user = await this.userService.findOne(userId);

    if (!company) {
      throw new NotFoundException("Компания не найдена");
    }

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    if (!company.users) {
      company.users = [];
    }

    await company.$remove('users', user);

    return company;
  }

  async getMembers(companyId: number): Promise<CompanyModel > {
    const companyMembers = await CompanyModel.findByPk(companyId, {
      include: [UserModel]
    });

    if (!companyMembers) {
      throw new NotFoundException("Компания не найдена");
    }

    return companyMembers
  }
}
