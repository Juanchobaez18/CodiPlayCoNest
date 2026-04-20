import { Injectable, Inject, UnauthorizedException } from '@nestjs/common'; // Añade Inject
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { ConfigType } from '@nestjs/config'; // Importa ConfigType
import config from '../../config'; // Importa tu archivo de configuración
import { UsersService } from '../../users/services/users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    //Cambiamos ConfigService por la inyección directa de tu ConfigType
    @Inject(config.KEY) configType: ConfigType<typeof config>,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      //Accedemos igual que en el AuthModule
      secretOrKey: configType.jwt.secret!, 
    });
  }

  async validate(payload: JwtPayload) {
    // payload.sub es el ID que viene en el token
    const user = await this.userService.findOne(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }
}