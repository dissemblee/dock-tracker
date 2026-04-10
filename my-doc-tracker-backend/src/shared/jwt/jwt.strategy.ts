import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

interface JwtPayload {
  id: number;
  email: string;
  role: string;
  companyId?: number | null;
  workMode?: string;
  activeCompanyId?: number | null;
}

export interface JwtUser {
  id: number;
  email: string;
  role: string;
  companyId?: number | null;
  workMode?: string;
  activeCompanyId?: number | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => {
          if (req?.cookies?.jwt) {
            return req.cookies.jwt;
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    this.logger.log('=== JWT Strategy Validate ===');
    this.logger.log(`Payload: ${JSON.stringify(payload)}`);
    this.logger.log(`Payload id type: ${typeof payload.id}, value: ${payload.id}`);
    
    const userId = Number(payload.id);
    this.logger.log(`Converted userId: ${userId}, type: ${typeof userId}`);
    
    const user = await this.userService.currentUser(userId);
    
    this.logger.log(`User from database: ${JSON.stringify(user)}`);
    
    if (!user) {
      this.logger.error(`User with ID ${userId} not found in database`);
      throw new Error(`Пользователь с ID ${userId} не найден`);
    }
    
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      workMode: user.workMode,
      activeCompanyId: user.activeCompanyId,
    };
  }
}