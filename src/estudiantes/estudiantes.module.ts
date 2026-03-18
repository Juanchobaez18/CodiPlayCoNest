import { Module } from '@nestjs/common';
import { EstudiantesService } from './service/estudiantes/estudiantes.service';
import { EstudiantesController } from './controller/estudiantes/estudiantes.controller';
import { Estudiante } from './entities/estudiantes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [EstudiantesService],
  controllers: [EstudiantesController],
  imports: [
    TypeOrmModule.forFeature([Estudiante])
  ]
})
export class EstudiantesModule {}
