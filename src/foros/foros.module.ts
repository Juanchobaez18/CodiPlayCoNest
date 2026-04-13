import { Module } from '@nestjs/common';
import { ForumController } from './controllers/forum.controller';
import { ForumService } from './services/forum.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Forum } from './entities/forum.entity';
import { Docente } from '../docente/entities/docente.entity';
import { Estudiante } from '../estudiantes/entities/estudiantes.entity';
import { Modulos } from '../modulos/entities/modulos.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Forum, Docente, Estudiante, Modulos])
  ],
  controllers: [ForumController],
  providers: [ForumService],
  exports: [ForumService]
})
export class ForosModule {}
