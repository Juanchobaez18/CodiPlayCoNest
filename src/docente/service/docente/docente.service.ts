import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Docente } from 'src/docente/entities/docente.entity';
import { CreateDocenteDto, UpdateDocenteDto } from 'src/docente/dtos/docente.dto';
import { UsersService } from 'src/users/services/users/users.service';

@Injectable()
export class DocenteService {

constructor(
    @InjectRepository(Docente)
    private docenteRepo: Repository<Docente>,

    private usersService: UsersService, // 🔥 conexión con user
) {}

  // 🔥 CREATE (crea usuario + docente)
async create(createDocenteDto: CreateDocenteDto) {

    const { user, ...docenteData } = createDocenteDto;

    // 1️⃣ crear usuario
    const newUser = await this.usersService.create(user);

    // 2️⃣ crear docente
    const docente = this.docenteRepo.create({
    ...docenteData,
    user: newUser,
    });

    return await this.docenteRepo.save(docente);
}

  // 🔍 GET ALL
async findAll() {
    return this.docenteRepo.find({
relations: ['user', 'user.roles'],
    });
}

  // 🔍 GET ONE
async findOne(id: number) {
    const docente = await this.docenteRepo.findOne({
    where: { id },
    relations: ['user', 'user.roles'],
    });

    if (!docente) {
    throw new NotFoundException(`Docente #${id} not found`);
    }

    return docente;
}

  // ✏️ UPDATE
async update(id: number, updateDocenteDto: UpdateDocenteDto) {

    const docente = await this.findOne(id);

    const { user, ...docenteData } = updateDocenteDto;

    // actualizar docente
    this.docenteRepo.merge(docente, docenteData);

    // actualizar user si viene
    if (user) {
    await this.usersService.updateUser(docente.user.id, user);
    }

    return this.docenteRepo.save(docente);
}

  // ❌ DELETE
  async remove(id: number) {
      const docente = await this.findOne(id);
      return this.docenteRepo.remove(docente);
  }

  // 🔍 FIND BY USER ID
  async findByUserId(userId: number, relations: string[] = []) {
    const docente = await this.docenteRepo.findOne({
      where: { user: { id: userId } },
      relations,
    });
    if (!docente) {
      throw new NotFoundException(`Docente con ID de usuario #${userId} no encontrado`);
    }
    return docente;
  }
}