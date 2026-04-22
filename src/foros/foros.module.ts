import { Module } from '@nestjs/common';
import { ForumController } from './controllers/forum.controller';
import { ForumService } from './services/forum.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Forum } from './entities/forum.entity';
import { Docente } from '../docente/entities/docente.entity';
import { Estudiante } from '../estudiantes/entities/estudiantes.entity';
import { Modulos } from '../modulos/entities/modulos.entity';
import { ForoRespuesta } from './entities/foro_respuesta.entity';
import { ForoRespuestaService } from './services/foro_respuesta.service';
import { ForoRespuestaController } from './controllers/foro_respuesta.controller';

@Module({
  imports:[
    TypeOrmModule.forFeature([Forum, Docente, Estudiante, Modulos, ForoRespuesta])
  ],
  controllers: [ForumController, ForoRespuestaController],
  providers: [ForumService, ForoRespuestaService],
  exports: [ForumService, ForoRespuestaService]
})
export class ForosModule {}