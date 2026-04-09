import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompanyMemberModel } from 'src/company/company-member.model';
import { CompanyAccessGuard } from './company-access.guard';

@Module({
  imports: [SequelizeModule.forFeature([CompanyMemberModel])],
  providers: [CompanyAccessGuard],
  exports: [CompanyAccessGuard],
})
export class CompanyAccessModule {}
