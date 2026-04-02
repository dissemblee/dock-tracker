import { forwardRef, Module } from '@nestjs/common';
import { CompanyModel } from './company.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/user/user.module';

@Module({
  imports: [
    SequelizeModule.forFeature([CompanyModel]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
