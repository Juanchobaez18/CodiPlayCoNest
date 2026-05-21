// src/lecciones/service/lecciones/lecciones.service.ts

import { Injectable, NotFoundException, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { Lecciones } from 'src/lecciones/entities/lecciones.entity';
import { ProgresoLeccion } from 'src/lecciones/entities/progreso.entity';
import { CreateLeccionesDto, UpdateLeccionesDto } from 'src/lecciones/dtos/lecciones.dto';

@Injectable()
export class LeccionesService {

  constructor(
    @InjectRepository(Lecciones)
    private leccionesRepo: Repository<Lecciones>,

    @InjectRepository(ProgresoLeccion)
    private progresoRepo: Repository<ProgresoLeccion>,
  ) {}

  async findAll(): Promise<Lecciones[]> {
    return await this.leccionesRepo.find();
  }

  async findOne(leccionesId: number): Promise<Lecciones> {
    const leccion = await this.leccionesRepo.findOne({
      where: { id: leccionesId },
    });
    if (!leccion) {
      throw new NotFoundException(`Lección #${leccionesId} no encontrada`);
    }
    return leccion;
  }

  async create(createLeccionesDto: CreateLeccionesDto): Promise<Lecciones> {
    const nuevaLeccion = this.leccionesRepo.create(createLeccionesDto);
    return await this.leccionesRepo.save(nuevaLeccion);
  }

  async updateLecciones(leccionesId: number, payload: UpdateLeccionesDto): Promise<Lecciones> {
    const leccion = await this.findOne(leccionesId);
    this.leccionesRepo.merge(leccion, payload);
    return await this.leccionesRepo.save(leccion);
  }

  async deleteLecciones(leccionesId: number): Promise<{ message: string; id: number }> {
    await this.findOne(leccionesId);
    await this.leccionesRepo.delete(leccionesId);
    return {
      message: 'Lección eliminada exitosamente',
      id: leccionesId
    };
  }

  async completarLeccion(
    leccionesId: number,
    body: { estado: string; notas: string; tiempo_total_minutos: number },
    @Req() request?: Request
  ): Promise<{ mensaje: string; leccionId: number; progreso: any }> {
    const leccion = await this.findOne(leccionesId);

    // Obtener estudiante autenticado del request
    const user = request?.user as any;
    const estudianteId = user?.id || user?.estudianteId;

    // Buscar si ya existe progreso para esta lección y estudiante
    let progreso = await this.progresoRepo.findOne({
      where: {
        leccion: { id: leccionesId },
        estudiante: { id: estudianteId }
      },
      relations: ['estudiante', 'leccion']
    });

    if (progreso) {
      // Actualizar progreso existente
      progreso.estado = body.estado || 'completada';
      progreso.fecha_completado = new Date();
      if (body.notas) progreso.notas = body.notas;
      if (body.tiempo_total_minutos) progreso.tiempo_total_minutos = body.tiempo_total_minutos;
    } else {
      // Crear nuevo progreso
      progreso = this.progresoRepo.create({
        leccion: leccion,
        estudiante: { id: estudianteId } as any,
        estado: body.estado || 'completada',
        fecha_inicio: new Date(),
        fecha_completado: new Date(),
        notas: body.notas,
        tiempo_total_minutos: body.tiempo_total_minutos
      });
    }

    const progresoGuardado = await this.progresoRepo.save(progreso);

    return {
      mensaje: 'Lección marcada como completada',
      leccionId: leccion.id,
      progreso: progresoGuardado
    };
  }
}