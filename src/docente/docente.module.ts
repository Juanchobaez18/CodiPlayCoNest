import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docente } from './entities/docente.entity';
import { Mensaje } from '../mensajes/entities/mensaje.entity';
import { DocenteService} from './service/docente/docente.service';
import { DocenteController} from './controller/docente/docente.controller';
import { DocentePanelController } from './controller/docente/docente-panel.controller';
import { UsersModule } from 'src/users/users.module';
import { MensajesModule } from '../mensajes/mensajes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Docente, Mensaje]),
    UsersModule, // 🔥 clave para usar UsersService
    MensajesModule,
  ],
  controllers: [DocenteController, DocentePanelController],
  providers: [DocenteService],
  exports: [DocenteService] // 🔥 exportamos el servicio para usarlo en otros módulos
})
export class DocenteModule {}