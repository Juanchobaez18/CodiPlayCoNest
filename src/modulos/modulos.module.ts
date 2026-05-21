import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeccionesModule } from 'src/lecciones/lecciones.module';
import { Modulos } from './entities/modulos.entity';
import { CursoModule } from 'src/curso/curso.module';
import { ModulosController } from './controller/modulos/modulos.controller';
import { ModulosService } from './service/modulos/modulos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Modulos]),
    CursoModule,
    forwardRef(() => LeccionesModule),
  ],
  controllers: [ModulosController],
  providers: [ModulosService],
  exports: [ModulosService], // 🔥 ESTA LÍNEA ES LA CLAVE
})
export class ModulosModule {}