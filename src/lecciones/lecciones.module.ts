import { forwardRef, Module } from '@nestjs/common';
import { ModulosModule } from 'src/modulos/modulos.module';
import { LeccionesService } from './service/lecciones/lecciones.service';
import { LeccionesController } from './controller/lecciones/lecciones.controller';
import { Lecciones } from './entities/lecciones.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lecciones]),
    forwardRef(() => ModulosModule),
  ],
  providers: [LeccionesService],
  controllers: [LeccionesController]
})
export class LeccionesModule {}