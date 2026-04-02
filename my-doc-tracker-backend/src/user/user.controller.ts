import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  Query,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { UserModel } from './user.model';
import { JwtAuthGuard } from 'src/shared/jwt/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<UserModel[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<UserModel> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get('current')
  async getCurrentUser(@Req() req: Request): Promise<UserModel | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req as any).user.id as number;
    return this.userService.currentUser(userId);
  }

  @Get('search/by-email')
  async searchByEmail(@Query('email') email: string): Promise<{ id: number; name: string; email: string; companyId: number | null }[]> {
    if (!email || email.length < 2) {
      return [];
    }
    return this.userService.findByEmailPartial(email);
  }

  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserModel> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userService.update(id, updateUserDto);
  }

  @Post('change-password')
  async changePassword(
    @Req() req: Request,
    @Body() body: { currentPassword: string; newPassword: string },
  ): Promise<{ result: { success: boolean } }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req as any).user.id as number;
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const success = await this.userService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );

    return { result: { success } };
  }
}
