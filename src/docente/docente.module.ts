import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docente } from './entities/docente.entity';
import { Mensaje } from '../mensajes/entities/mensaje.entity';
import { DocenteService} from './service/docente/docente.service';
import { DocenteController} from './controller/docente/docente.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Docente, Mensaje]),
    UsersModule // 🔥 clave para usar UsersService
  ],
  controllers: [DocenteController],
  providers: [DocenteService],
  exports: [DocenteService] // 🔥 exportamos el servicio para usarlo en otros módulos
})
export class DocenteModule {}