import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from 'src/user/user.model';
import { UserRole } from 'src/user/dto/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(UserModel)
    private userModel: typeof UserModel,
  ) {}

  async createAdmin() {
    const adminEmail = 'admin@admin.admin';
    const adminName = 'Admin';
    const adminPassword = 'admin123';

    const existingAdmin = await this.userModel.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      this.logger.log('Админ уже существует');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await this.userModel.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
    } as any);

    this.logger.log('Админ создан: admin@admin.admin / admin123');
  }
}
