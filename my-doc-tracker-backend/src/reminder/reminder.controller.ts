import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { JwtAuthGuard } from 'src/shared/jwt/jwt-auth.guard';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Post()
  async create(
    @Body() dto: CreateReminderDto,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.reminderService.create(dto, userId);
  }

  @Get()
  async findAll(@Query('userId', ParseIntPipe) userId: number) {
    return this.reminderService.findAll(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.reminderService.findOne(id, userId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReminderDto,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.reminderService.update(id, dto, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.reminderService.delete(id, userId);
  }
}
