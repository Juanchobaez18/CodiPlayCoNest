import { Module } from '@nestjs/common';
import { EstudiantesService } from './service/estudiantes/estudiantes.service';
import { EstudiantesController } from './controller/estudiantes/estudiantes.controller';
import { Estudiante } from './entities/estudiantes.entity';
import { Mensaje } from '../mensajes/entities/mensaje.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';

@Module({
  providers: [EstudiantesService],
  controllers: [EstudiantesController],
  imports: [
    TypeOrmModule.forFeature([Estudiante, Mensaje]),
    UsersModule,
  ]
})
export class EstudiantesModule {}
