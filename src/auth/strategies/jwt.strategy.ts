import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/services/users/users.service'; // ajusta según tu estructura
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import config from '../../config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(config.KEY) configType: ConfigType<typeof config>,
    private userService: UsersService,
    // private configService: ConfigService,
    // private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configType.jwt.secret!,
    });
  }

  async validate(payload: JwtPayload) {
    // ✅ Buscar usuario con roles y módulos
    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // ❌ Excluimos la contraseña
    const { password, ...result } = user;
    // Esto se asigna a req.user y puede usarse en guards
    return result;
  }
}