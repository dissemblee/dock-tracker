import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReminderService } from './reminder.service';
import { ReminderController } from './reminder.controller';
import { ReminderModel } from './reminder.model';
import { UserModel } from 'src/user/user.model';
import { DocumentModel } from 'src/document/document.model';

@Module({
  imports: [
    SequelizeModule.forFeature([ReminderModel, UserModel, DocumentModel]),
  ],
  controllers: [ReminderController],
  providers: [ReminderService],
  exports: [ReminderService],
})
export class ReminderModule {}
