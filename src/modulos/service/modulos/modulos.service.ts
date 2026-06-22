import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateModulosDto, UpdateModulosDto } from 'src/modulos/dtos/modulos.dto';
import { CursoService } from 'src/curso/service/curso/curso.service';
import { Modulos } from 'src/modulos/entities/modulos.entity';

@Injectable()
export class ModulosService {

  constructor(
    @InjectRepository(Modulos)
    private moduloRepo: Repository<Modulos>,

    private cursoService: CursoService,
  ) {}

  // 🔥 CREATE
  async create(createModulosDto: CreateModulosDto) {

    const { cursoId, ...moduloData } = createModulosDto;

    // validar curso
    const curso = await this.cursoService.findOne(cursoId);

    if (!curso) {
      throw new NotFoundException(`Curso #${cursoId} not found`);
    }

    const modulo = this.moduloRepo.create({
      ...moduloData,
      curso,
    });

    return this.moduloRepo.save(modulo);
  }

  // 🔍 GET ALL
  async findAll() {
    return this.moduloRepo.find({
      relations: ['curso'],
    });
  }

  // 🔍 GET ONE
  async findOne(id: number) {
    const modulo = await this.moduloRepo.findOne({
      where: { id },
      relations: ['curso', 'lecciones'],
    });

    if (!modulo) {
      throw new NotFoundException(`Modulo #${id} not found`);
    }

    return modulo;
  }

  // 🔍 GET BY CURSO
  async findByCurso(cursoId: number) {
    return this.moduloRepo.find({
      where: { curso: { id: cursoId } },
      relations: ['lecciones'],
      order: { orden: 'ASC' },
    });
  }

  // ✏️ UPDATE
  async update(id: number, updateDto: UpdateModulosDto) {

    const modulo = await this.findOne(id);

    const { cursoId, ...moduloData } = updateDto;

    if (cursoId) {
      const curso = await this.cursoService.findOne(cursoId);
      modulo.curso = curso;
    }

    this.moduloRepo.merge(modulo, moduloData);

    return this.moduloRepo.save(modulo);
  }

  // ❌ DELETE
  async remove(id: number) {
    const modulo = await this.findOne(id);
    return this.moduloRepo.remove(modulo);
  }
}