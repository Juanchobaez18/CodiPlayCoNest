import { Module } from '@nestjs/common';
import { LeccionesService } from './service/lecciones/lecciones.service';
import { LeccionesController } from './controller/lecciones/lecciones.controller';

@Module({
  providers: [LeccionesService],
  controllers: [LeccionesController]
})
export class LeccionesModule {}
