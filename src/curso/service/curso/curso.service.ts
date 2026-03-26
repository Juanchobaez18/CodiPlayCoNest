import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Curso } from 'src/curso/entity/curso.entity/curso.entity';
import { CreateCursoDto, UpdateCursoDto } from 'src/curso/dto/create-curso.dto/create-curso.dto';


@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
  ) {}

  create(data: CreateCursoDto) {
    const curso = this.cursoRepository.create(data);
    return this.cursoRepository.save(curso);
  }

  findAll() {
    return this.cursoRepository.find();
  }

  async findOne(id: number) {
    const curso = await this.cursoRepository.findOneBy({ id });
    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }
    return curso;
  }

  async update(id: number, data: UpdateCursoDto) {
    const curso = await this.findOne(id);
    Object.assign(curso, data);
    return this.cursoRepository.save(curso);
  }

  async remove(id: number) {
    const curso = await this.findOne(id);
    return this.cursoRepository.remove(curso);
  }
}