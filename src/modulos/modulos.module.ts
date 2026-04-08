import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ModulosService }  from './service/modulos/modulos.service';
import { ModulosController } from './controller/modulos/modulos.controller';
import { CursoModule } from 'src/curso/curso.module';
import { Modulos } from './entities/modulos.entity';
import { LeccionesModule } from 'src/lecciones/lecciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Modulos]),
    CursoModule, // 🔥 para usar CursoService
    LeccionesModule
  ],
  controllers: [ModulosController],
  providers: [ModulosService],
})
export class ModulosModule {}