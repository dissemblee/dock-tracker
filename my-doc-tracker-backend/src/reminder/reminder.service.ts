import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ReminderModel } from './reminder.model';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class ReminderService {
  constructor(
    @InjectModel(ReminderModel)
    private reminderModel: typeof ReminderModel,
  ) {}

  async create(dto: CreateReminderDto, userId: number) {
    return this.reminderModel.create({
      ...dto,
      userId,
    } as any);
  }

  async findAll(userId: number) {
    return this.reminderModel.findAll({
      where: { userId },
      order: [['remindAt', 'ASC']],
      include: ['document'],
    });
  }

  async findOne(id: number, userId: number) {
    const reminder = await this.reminderModel.findOne({
      where: { id, userId },
      include: ['document'],
    });

    if (!reminder) {
      throw new NotFoundException('Напоминание не найдено');
    }

    return reminder;
  }

  async update(id: number, dto: UpdateReminderDto, userId: number) {
    const reminder = await this.findOne(id, userId);
    
    const updateData: any = { ...dto };
    if (dto.remindAt) {
      updateData.remindAt = new Date(dto.remindAt);
    }
    
    await reminder.update(updateData);
    return reminder;
  }

  async delete(id: number, userId: number) {
    const reminder = await this.findOne(id, userId);
    await reminder.destroy();
    return { message: 'Напоминание удалено' };
  }

  async markAsSent(id: number) {
    const reminder = await this.reminderModel.findByPk(id);
    if (reminder) {
      reminder.isSent = true;
      await reminder.save();
    }
  }
}
