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
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { UserModel } from './user.model';
import { JwtAuthGuard } from 'src/shared/jwt/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateWorkModeDto } from './dto/update-work-mode.dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  private readonly logger = new Logger(UserController.name);

  @Get()
  async getAllUsers(): Promise<UserModel[]> {
    return this.userService.findAll();
  }

  @Get('/current')
  async getCurrentUser(@Req() req: Request): Promise<UserModel | null> {
    this.logger.log('=== GET /user/current ===');
    this.logger.log(`Request user: ${JSON.stringify((req as any).user)}`);
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req as any).user?.id;
    this.logger.log(`User ID from request: ${userId}, type: ${typeof userId}`);
    
    const numericId = Number(userId);
    this.logger.log(`Numeric ID: ${numericId}`);
    
    if (isNaN(numericId)) {
      this.logger.error('Invalid user ID');
      throw new NotFoundException('Invalid user ID');
    }
    
    const user = await this.userService.currentUser(numericId);
    this.logger.log(`Found user: ${JSON.stringify(user)}`);
    
    return user;
  }

  @Get('search/by-email')
  async searchByEmail(@Query('email') email: string): Promise<{ id: number; name: string; email: string; companyId: number | null }[]> {
    if (!email || email.length < 2) {
      return [];
    }
    return this.userService.findByEmailPartial(email);
  }
  /**
   * Переключить режим работы пользователя (personal / company)
   */
  @Patch('work-mode')
  async updateWorkMode(
    @Req() req: Request,
    @Body() dto: UpdateWorkModeDto,
  ): Promise<UserModel> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req as any).user.id as number;
    return this.userService.updateWorkMode(
      userId,
      dto.workMode,
      dto.activeCompanyId ?? null,
    );
  }
  
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<UserModel> {
    return this.userService.findOne(id);
  }
  
  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserModel> {
    return this.userService.update(id, updateUserDto);
  }

  @Post('change-password')
  async changePassword(
    @Req() req: Request,
    @Body() body: { currentPassword: string; newPassword: string },
  ): Promise<{ result: { success: boolean } }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req as any).user.id as number;

    const success = await this.userService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );

    return { result: { success } };
  }
}
