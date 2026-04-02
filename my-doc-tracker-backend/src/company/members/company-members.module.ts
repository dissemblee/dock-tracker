import { Module, forwardRef } from '@nestjs/common';
import { CompanyMembersService } from './company-members.service';
import { CompanyMembersController } from './company-members.controller';
import { CompanyModule } from '../company.module';
import { UsersModule } from 'src/user/user.module';

@Module({
  imports: [
    forwardRef(() => CompanyModule),
    UsersModule,
  ],
  controllers: [CompanyMembersController],
  providers: [CompanyMembersService],
  exports: [CompanyMembersService],
})
export class CompanyMembersModule {}
