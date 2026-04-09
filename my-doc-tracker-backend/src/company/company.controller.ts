import {
  Body,
  Controller,
  Post,
  Put,
  Req,
  Get,
  NotFoundException,
  ParseIntPipe,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import type { Request } from 'express';
import { UseAuth } from 'src/shared/jwt/auth.decorator';
import { Role } from 'src/shared/role-guard/roles.decorator';
import { CompanyService } from './company.service';
import { CompanyModel } from './company.model';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { CompanyMemberModel } from './company-member.model';

interface JwtUser {
  id: number;
  email: string;
  role: string;
  companyId: number | null;
}

@UseAuth()
@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post('/create')
  async create(
    @Body() dto: CreateCompanyDto,
    @Req() req: Request,
  ): Promise<CompanyModel> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req as any).user.id as number;
    return this.companyService.createWithUser(dto, userId);
  }

  @Put('/update')
  async update(
    @Body() dto: UpdateCompanyDto,
    @Req() req: Request,
  ): Promise<CompanyModel> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const companyId = (req as any).user.companyId as number;

    if (!companyId) {
      throw new NotFoundException('У вас нет компании');
    }

    return this.companyService.update(companyId, dto);
  }

  @Get('/current')
  async getCurrentCompany(
    @Req() req: Request,
  ): Promise<CompanyModel | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const companyId = (req as any).user.activeCompanyId as number | null;

    if (!companyId) {
      return null;
    }

    return this.companyService.findOne(companyId);
  }

  /**
   * Получить компании, в которых состоит пользователь
   */
  @Get('/my')
  async getMyCompanies(@Req() req: Request): Promise<CompanyModel[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req as any).user.id as number;
    return this.companyService.getUserCompanies(userId);
  }

  /**
   * Получить компанию с сотрудниками
   */
  @Get('/:id/members')
  async getCompanyWithMembers(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CompanyModel> {
    return this.companyService.getCompanyWithMembers(id);
  }

  /**
   * Получить список сотрудников компании (через company_members)
   */
  @Get('/:id/employees')
  async getCompanyEmployees(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CompanyMemberModel[]> {
    return this.companyService.getCompanyMembers(id);
  }

  /**
   * Пригласить сотрудника по email
   */
  @Post('/:id/invite')
  async inviteMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InviteMemberDto,
    @Req() req: Request,
  ): Promise<{ message: string; member?: CompanyMemberModel }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req as any).user.id as number;
    return this.companyService.inviteMember(id, dto.email, userId);
  }

  /**
   * Удалить сотрудника из компании
   */
  @Delete('/:id/members/:userId')
  async removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const removerId = (req as any).user.id as number;
    return this.companyService.removeMember(id, userId, removerId);
  }

  /**
   * Покинуть компанию
   */
  @Post('/leave')
  async leaveCompany(@Req() req: Request): Promise<{ message: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req as any).user.id as number;
    return this.companyService.leaveCompany(userId);
  }

  /**
   * Принять приглашение (привязывает текущего пользователя к компании)
   */
  @Post('/:id/accept-invite')
  async acceptInvite(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<CompanyMemberModel> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req as any).user.id as number;
    return this.companyService.acceptInvite(userId, id);
  }
}
