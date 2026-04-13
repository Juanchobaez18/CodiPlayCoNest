import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Mensaje } from './entities/mensaje.entity';
import { Estudiante } from 'src/estudiantes/entities/estudiantes.entity';
import { Docente } from 'src/docente/entities/docente.entity';

import { MensajesService } from 'src/mensajes/service/mensajes.service';
import { MensajesController } from 'src/mensajes/controller/mensajes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mensaje, Estudiante, Docente])],
  controllers: [MensajesController],
  providers: [MensajesService],
  exports: [MensajesService],
})
export class MensajesModule {
  
}