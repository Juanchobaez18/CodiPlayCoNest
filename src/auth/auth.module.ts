import { Module } from '@nestjs/common';
import { AuthService } from '../auth/services/auth.service';
import { AuthController } from '../auth/controllers/auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigType } from '@nestjs/config';
import config from '../config';
import { ModulesGuard } from './guards/modules.guard.guard';
import { JwtAuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [config.KEY],
      useFactory: (configType: ConfigType<typeof config>) => ({
        secret: configType.jwt.secret,
        signOptions: { expiresIn: configType.jwt.expiresIn },
      }),
    }),
  ],
  // providers: [AuthService, JwtStrategy],
  providers: [AuthService, ModulesGuard, JwtAuthGuard, JwtStrategy], // 🔹 AuthService incluido
  controllers: [AuthController],
  exports: [AuthService, ModulesGuard, JwtAuthGuard],
})
export class AuthModule {}
