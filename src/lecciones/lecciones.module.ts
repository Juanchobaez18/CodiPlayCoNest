import { Module } from '@nestjs/common';
import { LeccionesService } from './service/lecciones/lecciones.service';
import { LeccionesController } from './controller/lecciones/lecciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lecciones } from './entities/lecciones.entity';
import { ModulosModule } from 'src/modulos/modulos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lecciones]),
    ModulosModule // 🔥 obligatorio
  ],
  providers: [LeccionesService],
  controllers: [LeccionesController]
})
export class LeccionesModule {}