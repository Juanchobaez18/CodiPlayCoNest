import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docente } from './entities/docente.entity';
import { Mensaje } from '../mensajes/entities/mensaje.entity';
import { Curso } from '../curso/entity/curso.entity/curso.entity';
import { Estudiante } from '../estudiantes/entities/estudiantes.entity';
import { DocenteService } from './service/docente/docente.service';
import { DocenteController } from './controller/docente/docente.controller';
import { DocentePanelService } from './service/docente-panel/docente-panel.service';
import { DocentePanelController } from './controller/docente-panel/docente-panel.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Docente, Mensaje, Curso, Estudiante]),
    UsersModule // 🔥 clave para usar UsersService
  ],
  controllers: [DocenteController, DocentePanelController],
  providers: [DocenteService, DocentePanelService],
  exports: [DocenteService, DocentePanelService] // 🔥 exportamos los servicios para usarlos en otros módulos
})
export class DocenteModule {}