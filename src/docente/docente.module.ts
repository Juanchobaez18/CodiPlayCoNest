import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docente } from './entities/docente.entity';
import { Tarea } from './entities/tarea.entity';
import { TareaEntrega } from './entities/tarea-entrega.entity';
import { LeccionProgreso } from './entities/leccion-progreso.entity';
import { Mensaje } from '../mensajes/entities/mensaje.entity';
import { Curso } from '../curso/entity/curso.entity/curso.entity';
import { Estudiante } from '../estudiantes/entities/estudiantes.entity';
import { Forum } from '../foros/entities/forum.entity';
import { ForoRespuesta } from '../foros/entities/foro_respuesta.entity';
import { Modulos } from '../modulos/entities/modulos.entity';
import { Lecciones } from '../lecciones/entities/lecciones.entity';
import { User } from '../users/entities/user.entity';
import { DocenteService } from './service/docente/docente.service';
import { DocenteController } from './controller/docente/docente.controller';
import { DocentePanelService } from './service/docente-panel/docente-panel.service';
import { DocentePanelController } from './controller/docente-panel/docente-panel.controller';
import { AccesoFuncionalDocenteGuard } from './guards/acceso-funcional-docente.guard';
import { PanelOModulosGuard } from './guards/panel-o-modulos.guard';
import { ModulesGuard } from 'src/auth/guards/modules.guard.guard';
import { UsersModule } from 'src/users/users.module';
import { ProgressModule } from 'src/progress/progress.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Docente,
      Tarea,
      TareaEntrega,
      LeccionProgreso,
      Mensaje,
      Curso,
      Estudiante,
      Forum,
      ForoRespuesta,
      Modulos,
      Lecciones,
      User,
    ]),
    UsersModule,
    ProgressModule,
  ],
  controllers: [DocenteController, DocentePanelController],
  providers: [
    DocenteService,
    DocentePanelService,
    AccesoFuncionalDocenteGuard,
    PanelOModulosGuard,
    ModulesGuard,
  ],
  exports: [
    DocenteService,
    DocentePanelService,
    AccesoFuncionalDocenteGuard,
    PanelOModulosGuard,
  ],
})
export class DocenteModule {}
