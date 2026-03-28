import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './auth.dto';
import { RegisterDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { UserRole } from 'src/user/dto/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; user: { id: number; name: string; email: string; role: string } }> {
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
      { id: user.id, email: user.email, role: user.role, name: user.name },
      { secret: this.configService.get<string>('JWT_SECRET') },
    );
    return {
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async register(dto: RegisterDto): Promise<{ accessToken: string; user: { id: number; name: string; email: string; role: string } }> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ForbiddenException('Пользователь с таким email уже существует');
    }

    const hash = await bcrypt.hash(dto.password, 10);
    const newUser = await this.usersService.create({
      ...dto,
      password: hash,
      role: UserRole.NO_ROLE,
    });
    const accessToken = this.jwtService.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      { secret: this.configService.get<string>('JWT_SECRET') },
    );
    return {
      accessToken,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    };
  }
}
