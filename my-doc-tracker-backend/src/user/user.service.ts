import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/base/base.service';
import { UserModel } from './user.model';
import { InjectModel } from '@nestjs/sequelize/dist/common/sequelize.decorators';

@Injectable()
export class UserService extends BaseService<UserModel> {
  constructor(@InjectModel(UserModel) private userModel: typeof UserModel) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async currentUser(id: number): Promise<UserModel | null> {
    return this.userModel.findByPk(id);
  }
}
