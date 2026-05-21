import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Curso } from 'src/curso/entity/curso.entity/curso.entity';
import { CreateCursoDto, UpdateCursoDto } from 'src/curso/dto/create-curso.dto/create-curso.dto';
import { Docente } from 'src/docente/entities/docente.entity';
import { Estudiante } from 'src/estudiantes/entities/estudiantes.entity';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
  ) {}

  create(data: CreateCursoDto) {
    const { docenteId, estudiantesIds = [], ...rest } = data;
    const curso = this.cursoRepository.create({
      ...rest,
      docente: { id: docenteId } as Docente,
      estudiantes: estudiantesIds.map((id) => ({ id }) as Estudiante),
    });
    return this.cursoRepository.save(curso);
  }

  findAll() {
    return this.cursoRepository.find({
      relations: ['docente', 'docente.user'],
    });
  }

  async findOne(id: number) {
    const curso = await this.cursoRepository.findOne({
      where: { id },
      relations: ['docente', 'docente.user', 'estudiantes'],
    });
    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }
    return curso;
  }

  async update(id: number, data: UpdateCursoDto) {
    const curso = await this.findOne(id);
    const { docenteId, estudiantesIds, ...rest } = data;
    Object.assign(curso, rest);
    if (docenteId !== undefined) {
      curso.docente = { id: docenteId } as Docente;
    }
    if (estudiantesIds !== undefined) {
      curso.estudiantes = estudiantesIds.map((eid) => ({ id: eid }) as Estudiante);
    }
    return this.cursoRepository.save(curso);
  }

  async remove(id: number) {
    const curso = await this.findOne(id);
    return this.cursoRepository.remove(curso);
  }
}