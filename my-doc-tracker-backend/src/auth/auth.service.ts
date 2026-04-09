import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { UserRole } from 'src/user/dto/user-role.enum';
import { CompanyService } from 'src/company/company.service';
import { WorkMode } from 'src/user/user.model';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private companyService: CompanyService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; user: { id: number; name: string; email: string; role: string; companyId?: number | null; workMode?: string; activeCompanyId?: number | null } }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new ForbiddenException('Неверный email или пароль');
    }

    const passwordHash = user.getDataValue('password') || user.password;

    if (!passwordHash) {
      throw new ForbiddenException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, passwordHash);

    if (!isPasswordValid) {
      throw new ForbiddenException('Неверный email или пароль');
    }

    const accessToken = this.jwtService.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        workMode: user.workMode,
        activeCompanyId: user.activeCompanyId,
      },
      { secret: this.configService.get<string>('JWT_SECRET') },
    );
    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        workMode: user.workMode,
        activeCompanyId: user.activeCompanyId,
      },
    };
  }

  async register(dto: RegisterDto): Promise<{ accessToken: string; user: { id: number; name: string; email: string; role: string; companyId?: number | null; workMode?: string; activeCompanyId?: number | null } }> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ForbiddenException('Пользователь с таким email уже существует');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const newUser = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hash,
      role: UserRole.NO_ROLE,
      companyId: null,
    });

    let companyId: number | null = null;
    let workMode = WorkMode.PERSONAL;
    let activeCompanyId: number | null = null;

    if ('createCompany' in dto && dto.createCompany && dto.companyName) {
      const company = await this.companyService.createWithUser(
        { name: dto.companyName },
        newUser.id
      );
      companyId = company.id;
      workMode = WorkMode.COMPANY;
      activeCompanyId = company.id;
    }

    const accessToken = this.jwtService.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        companyId,
        workMode,
        activeCompanyId,
      },
      { secret: this.configService.get<string>('JWT_SECRET') },
    );
    return {
      accessToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        companyId,
        workMode,
        activeCompanyId,
      },
    };
  }
}
