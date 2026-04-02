import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

interface JwtPayload {
  id: number;
  email: string;
  role: string;
  companyId?: number | null;
}

export interface JwtUser {
  id: number;
  email: string;
  role: string;
  companyId?: number | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Пробуем извлечь из Authorization header (для API запросов)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // 2. Пробуем извлечь из cookies (для браузерных запросов)
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
    const user = await this.userService.currentUser(payload.id);

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };
  }
}
