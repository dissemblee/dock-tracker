import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { UseAuth } from 'src/shared/jwt/auth.decorator';
import { CompanyMembersService } from './company-members.service';
import { InviteMemberDto } from '../dto/invite-member.dto';
import { UserModel } from 'src/user/user.model';

interface JwtUser {
  id: number;
  email: string;
  role: string;
  companyId: number | null;
}

@UseAuth()
@Controller('company')
export class CompanyMembersController {
  constructor(private membersService: CompanyMembersService) {}

  @Get(':id/members')
  async getMembers(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<UserModel[]> {
    const user = req.user as JwtUser;

    if (!user.companyId || user.companyId !== id) {
      throw new ForbiddenException('Доступ только для участников компании');
    }

    return this.membersService.getMembers(id);
  }

  @Post(':id/invite')
  async inviteMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InviteMemberDto,
    @Req() req: Request,
  ): Promise<{ message: string; user: UserModel }> {
    const user = req.user as JwtUser;

    if (!user.companyId || user.companyId !== id) {
      throw new ForbiddenException('Доступ только для участников компании');
    }

    return this.membersService.inviteMember(id, dto.email, user.id);
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const user = req.user as JwtUser;

    if (!user.companyId || user.companyId !== id) {
      throw new ForbiddenException('Доступ только для участников компании');
    }

    return this.membersService.removeMember(id, userId, user.id);
  }
}
