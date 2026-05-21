// src/lecciones/lecciones.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeccionesService } from './service/lecciones/lecciones.service';
import { LeccionesController } from './controller/lecciones/lecciones.controller';
import { Lecciones } from './entities/lecciones.entity';
import { ProgresoLeccion } from './entities/progreso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lecciones, ProgresoLeccion])],
  providers: [LeccionesService],
  controllers: [LeccionesController]
})
export class LeccionesModule {}