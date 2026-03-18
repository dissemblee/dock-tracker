import { Body, Controller, Post, Put, Req } from '@nestjs/common';
import { UseAuth } from 'src/shared/jwt/auth.decorator';
import { Role } from 'src/shared/role-guard/roles.decorator';
import { CompanyService } from './company.service';
import { CompanyModel } from './company.model';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@UseAuth()
@Role("admin")
@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}
  
  @Post('/crete')
  async create(
    @Body() dto: CreateCompanyDto,
    @Req() req: Request
  ): Promise<CompanyModel> {
    const userId = (req as any).user.id; 
    return this.companyService.createWithUser(dto, userId)
  }

  @Put('/update')
  async update(
    @Body() dto: UpdateCompanyDto,
    @Req() req: Request
  ): Promise<void> {
    const companyId = (req as any).user.companyId;
    this.companyService.update(companyId, dto)
  }
}
