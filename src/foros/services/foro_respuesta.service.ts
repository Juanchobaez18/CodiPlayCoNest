import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForoRespuesta } from '../entities/foro_respuesta.entity';
import { CrearForoRespuestaDto } from '../dtos/crear_foro_respuesta.dto';
import { Forum } from '../entities/forum.entity';
import { Estudiante } from '../../estudiantes/entities/estudiantes.entity';
import { Docente } from '../../docente/entities/docente.entity';

@Injectable()
export class ForoRespuestaService {

  constructor(
    @InjectRepository(ForoRespuesta)
    private foroRespuestaRepo: Repository<ForoRespuesta>,

    @InjectRepository(Forum)
    private foroRepo: Repository<Forum>,

    @InjectRepository(Estudiante)
    private estudianteRepo: Repository<Estudiante>,

    @InjectRepository(Docente)
    private docenteRepo: Repository<Docente>,
  ) {}

  async crear(dto: CrearForoRespuestaDto): Promise<ForoRespuesta> {
    const foro = await this.foroRepo.findOne({ where: { id: dto.foroId } });
    if (!foro) throw new NotFoundException(`Foro con id ${dto.foroId} no encontrado`);

    const respuesta = this.foroRespuestaRepo.create({ contenido: dto.contenido, foro });

    if (dto.estudianteId) {
      const estudiante = await this.estudianteRepo.findOne({ where: { id: dto.estudianteId } });
      if (!estudiante) throw new NotFoundException(`Estudiante con id ${dto.estudianteId} no encontrado`);
      respuesta.estudiante = estudiante;
    }

    if (dto.docenteId) {
      const docente = await this.docenteRepo.findOne({ where: { id: dto.docenteId } });
      if (!docente) throw new NotFoundException(`Docente con id ${dto.docenteId} no encontrado`);
      respuesta.docente = docente;
    }

    return this.foroRespuestaRepo.save(respuesta);
  }

  async obtenerPorForo(foroId: number): Promise<ForoRespuesta[]> {
    return this.foroRespuestaRepo.find({
      where: { foro: { id: foroId } },
      relations: ['estudiante', 'docente'],
      order: { fecha_creacion: 'ASC' },
    });
  }
}