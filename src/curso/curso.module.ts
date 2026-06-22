import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Curso } from 'src/curso/entity/curso.entity/curso.entity';
import { CursoService } from './service/curso/curso.service';
import { CursoController } from 'src/curso/controller/curso/curso.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Curso])],
  controllers: [CursoController],
  providers: [CursoService],
  exports: [CursoService] // 🔥 ESTO FALTABA
})
export class CursoModule {}