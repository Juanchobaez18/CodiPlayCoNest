import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Mensaje } from 'src/mensajes/entities/mensaje.entity';
import { CrearMensajeDto, RemitenteTipo, MensajeEstado } from 'src/mensajes/dto/crear-mensaje.dto';

import { Estudiante } from 'src/estudiantes/entities/estudiantes.entity';
import { Docente } from 'src/docente/entities/docente.entity';

@Injectable()
export class MensajesService {
  constructor(
    @InjectRepository(Mensaje)
    private mensajeRepo: Repository<Mensaje>,

    @InjectRepository(Estudiante)
    private estudianteRepo: Repository<Estudiante>,

    @InjectRepository(Docente)
    private docenteRepo: Repository<Docente>,
  ) {}

  async crear(dto: CrearMensajeDto) {
    const { estudianteId, docenteId, remitenteTipo, contenido } = dto;

    const estudiante = await this.estudianteRepo.findOne({
      where: { id: estudianteId },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const docente = await this.docenteRepo.findOne({
      where: { id: docenteId },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    if (!Object.values(RemitenteTipo).includes(remitenteTipo)) {
      throw new BadRequestException('Remitente inválido');
    }

    const mensaje = this.mensajeRepo.create({
      contenido,
      remitenteTipo,
      estudiante,
      docente,
    });

    return await this.mensajeRepo.save(mensaje);
  }

  async obtenerConversacion(estudianteId: number, docenteId: number) {
  return await this.mensajeRepo
    .createQueryBuilder('mensaje')
    .leftJoinAndSelect('mensaje.estudiante', 'estudiante')
    .leftJoinAndSelect('mensaje.docente', 'docente')
    .where('estudiante.id = :idEst', { idEst: estudianteId })
    .andWhere('docente.id = :idDoc', { idDoc: docenteId })
    .orderBy('mensaje.fecha_envio', 'ASC')
    .getMany();
}

  async marcarLeido(id: number) {
    const mensaje = await this.mensajeRepo.findOne({
      where: { id },
    });

    if (!mensaje) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    mensaje.estado = MensajeEstado.LEIDO;
    mensaje.fecha_lectura = new Date();

    return await this.mensajeRepo.save(mensaje);
  }
}