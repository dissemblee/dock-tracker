import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BaseService } from 'src/shared/base/base.service';
import { UserModel } from './user.model';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize, QueryTypes } from 'sequelize';

@Injectable()
export class UserService extends BaseService<UserModel> {
  constructor(@InjectModel(UserModel) private userModel: typeof UserModel) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    const user = await this.userModel.findOne({
      where: { email }
    });

    // Получаем пароль через getDataValue, т.к. поле может быть скрыто
    if (user && !user.password) {
      const rawUser = await this.userModel.sequelize.query(
        `SELECT password FROM users WHERE email = :email`,
        { replacements: { email }, type: QueryTypes.SELECT, plain: true }
      ) as any;
      if (rawUser) {
        Object.assign(user, { password: rawUser.password });
      }
    }

    return user;
  }

  async currentUser(id: number): Promise<UserModel | null> {
    return this.userModel.findByPk(id);
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    // Получаем пароль через raw query
    const rawUser = await this.userModel.sequelize.query(
      `SELECT password FROM users WHERE id = :id`,
      { replacements: { id: userId }, type: QueryTypes.SELECT, plain: true }
    ) as any;

    if (!rawUser || !rawUser.password) {
      return false;
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      rawUser.password,
    );
    if (!isPasswordValid) {
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Обновляем пароль через raw SQL запрос
    await this.userModel.sequelize.query(
      `UPDATE users SET password = :password, "updatedAt" = :updatedAt WHERE id = :id`,
      { 
        replacements: { 
          password: hashedPassword, 
          updatedAt: new Date(), 
          id: userId 
        } 
      }
    );

    return true;
  }

  async findByEmailPartial(email: string): Promise<{ id: number; name: string; email: string; companyId: number | null }[]> {
    const users = await this.userModel.findAll({
      where: {
        email: {
          [require('sequelize').Op.iLike]: `%${email}%`,
        },
      },
      attributes: ['id', 'name', 'email', 'companyId'],
      limit: 10,
    });

    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      companyId: u.companyId,
    }));
  }
}
