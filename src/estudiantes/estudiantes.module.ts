import { Module } from '@nestjs/common';
import { EstudiantesService } from './service/estudiantes/estudiantes.service';
import { EstudiantesController } from './controller/estudiantes/estudiantes.controller';
import { Estudiante } from './entities/estudiantes.entity';
import { Mensaje } from '../mensajes/entities/mensaje.entity';
import { LeccionProgreso } from '../docente/entities/leccion-progreso.entity';
import { TareaEntrega } from '../docente/entities/tarea-entrega.entity';
import { Tarea } from '../docente/entities/tarea.entity';
import { Docente } from '../docente/entities/docente.entity';
import { Lecciones } from '../lecciones/entities/lecciones.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  providers: [EstudiantesService],
  controllers: [EstudiantesController],
  imports: [
    TypeOrmModule.forFeature([Estudiante, Mensaje, TareaEntrega, Tarea, Docente, Lecciones]),
    UsersModule,
    ProgressModule,
  ],
  exports: [EstudiantesService],
})
export class EstudiantesModule {}
