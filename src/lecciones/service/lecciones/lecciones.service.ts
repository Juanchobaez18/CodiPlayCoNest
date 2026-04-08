import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Lecciones } from 'src/lecciones/entities/lecciones.entity';
import { CreateLeccionesDto, UpdateLeccionesDto } from 'src/lecciones/dtos/lecciones.dto';
import { ModulosService } from 'src/modulos/service/modulos/modulos.service';


@Injectable()
export class LeccionesService {

  constructor(
    @InjectRepository(Lecciones)
    private leccionesRepo: Repository<Lecciones>,

    private moduloService: ModulosService, // 🔥 CORRECTO
  ) {}

  async findAll() {
    return await this.leccionesRepo.find({
      relations: ['modulo'], // 🔥 singular
    });
  }

  async findOne(leccionesId: number) {
    const leccion = await this.leccionesRepo.findOne({
      where: { id: leccionesId },
      relations: ['modulo'],
    });

    if (!leccion) {
      throw new NotFoundException(`Leccion #${leccionesId} not found`);
    }

    return leccion;
  }

  async create(createLeccionesDto: CreateLeccionesDto) {
    const { moduloId, ...leccionesData } = createLeccionesDto;
    // validar modulo
    const modulo = await this.moduloService.findOne(moduloId);
    if (!modulo) {
      throw new NotFoundException(`Modulo #${moduloId} not found`);
    }
    const leccion = this.leccionesRepo.create({
      ...leccionesData,
      modulo: modulo as any,

    });
    return this.leccionesRepo.save(leccion);
  }

 async update(id: number, updateDto: UpdateLeccionesDto) {

    const leccion = await this.findOne(id);

    const { moduloId, ...leccionesData } = updateDto;

    if (moduloId) {
      const modulo = await this.moduloService.findOne(moduloId);
      leccion.modulo = modulo as any;
    }

    this.leccionesRepo.merge(leccion, leccionesData);

    return this.leccionesRepo.save(leccion);
  }



  async deleteLecciones(leccionesId: number) {
    return this.leccionesRepo.delete(leccionesId);
  }
}