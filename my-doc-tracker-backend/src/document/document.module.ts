import { forwardRef, Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DocumentModel } from './document.model';
import { AuthModule } from 'src/auth/auth.module';
import { CompanyModule } from 'src/company/company.module';
import { S3Module } from 'src/shared/s3/s3.module';
import { UsersModule } from 'src/user/user.module';

@Module({
  imports: [
    SequelizeModule.forFeature([DocumentModel]),
    forwardRef(() => AuthModule),
    CompanyModule,
    S3Module,
    UsersModule,
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
