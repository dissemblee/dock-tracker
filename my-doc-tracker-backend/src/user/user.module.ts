import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserModel } from './user.model';
import { CompanyMemberModel } from 'src/company/company-member.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel, CompanyMemberModel]),
    forwardRef(() => AuthModule),
    forwardRef(() => CompanyModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
