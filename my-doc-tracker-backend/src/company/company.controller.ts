import { Body, Controller, Post, Put, Req, Get, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';
import { UseAuth } from 'src/shared/jwt/auth.decorator';
import { Role } from 'src/shared/role-guard/roles.decorator';
import { CompanyService } from './company.service';
import { CompanyModel } from './company.model';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@UseAuth()
@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post('/create')
  @Role('admin')
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
    const companyId = (req as any).user.companyId as number | null;
    
    if (!companyId) {
      return null;
    }
    
    return this.companyService.findOne(companyId);
  }
}
