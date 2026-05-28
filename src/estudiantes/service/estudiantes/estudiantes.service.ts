import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from '../../entities/estudiantes.entity';
import { CreateEstudianteDto, UpdateEstudianteDto } from '../../dtos/estudiante.dto';
import { UsersService } from '../../../users/services/users/users.service';

@Injectable()
export class EstudiantesService {

    constructor(
        @InjectRepository(Estudiante) private estudianteRepo: Repository<Estudiante>,
        private usersService: UsersService,
    ) {}

    async findAll() {
        return await this.estudianteRepo.find({ relations: ['user'] });
    }

    async findOne(id: number) {
        const estudiante = await this.estudianteRepo.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!estudiante) {
            throw new NotFoundException(`Estudiante #${id} no encontrado`);
        }
        return estudiante;
    }

    async create(createEstudianteDto: CreateEstudianteDto) {
        const { userId, ...estudianteData } = createEstudianteDto;

        // Verificar que el usuario existe
        const user = await this.usersService.findOne(userId);

        // Verificar que el usuario no esté ya asignado a otro estudiante (OneToOne)
        const existente = await this.estudianteRepo.findOne({
            where: { user: { id: userId } },
        });
        if (existente) {
            throw new BadRequestException(`El usuario #${userId} ya está asignado a un estudiante`);
        }

        const estudiante = this.estudianteRepo.create({
            ...estudianteData,
            fecharegistro: new Date().toISOString().split('T')[0], // Fecha actual YYYY-MM-DD
            user,
        });
        return await this.estudianteRepo.save(estudiante);
    }

    async update(id: number, updateEstudianteDto: UpdateEstudianteDto) {
        const estudiante = await this.estudianteRepo.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!estudiante) {
            throw new NotFoundException(`Estudiante #${id} no encontrado`);
        }

        // Si se quiere cambiar el usuario asociado
        if (updateEstudianteDto.userId) {
            const user = await this.usersService.findOne(updateEstudianteDto.userId);

            // Verificar que el nuevo usuario no esté asignado a otro estudiante
            const existente = await this.estudianteRepo.findOne({
                where: { user: { id: updateEstudianteDto.userId } },
            });
            if (existente && existente.id !== id) {
                throw new BadRequestException(`El usuario #${updateEstudianteDto.userId} ya está asignado a otro estudiante`);
            }

            estudiante.user = user;
        }

        const { userId, ...data } = updateEstudianteDto;
        this.estudianteRepo.merge(estudiante, data);

        return await this.estudianteRepo.save(estudiante);
    }

    async remove(id: number) {
        const estudiante = await this.estudianteRepo.findOne({ where: { id } });
        if (!estudiante) {
            throw new NotFoundException(`Estudiante #${id} no encontrado`);
        }
        return await this.estudianteRepo.remove(estudiante);
    }
    async findByUserId(userId: number) {
    const estudiante = await this.estudianteRepo.findOne({
        where: { user: { id: userId } },
        relations: {
            user: true,
            cursos: true,
            foros: true,
            mensajes: {
                docente: {
                    user: true
                }
            },
            leccionesCompletadas: true,
        },
    });
    if (!estudiante) throw new NotFoundException(`Estudiante del usuario #${userId} no encontrado`);
    return estudiante;
}

async marcarLeccionCompletada(userId: number, leccionId: number) {
    const estudiante = await this.estudianteRepo.findOne({
        where: { user: { id: userId } },
        relations: {
            leccionesCompletadas: true,
            cursos: {
                modulos: {
                    lecciones: true
                }
            }
        },
    });
    
    if (!estudiante) throw new NotFoundException(`Estudiante del usuario #${userId} no encontrado`);

    const yaCompletada = estudiante.leccionesCompletadas.find(l => l.id === leccionId);
    if (!yaCompletada) {
        estudiante.leccionesCompletadas.push({ id: leccionId } as any);
    }

    let totalLecciones = 0;
    if (estudiante.cursos) {
        for (const c of estudiante.cursos) {
            if (c.modulos) {
                for (const m of c.modulos) {
                    if (m.lecciones) {
                        totalLecciones += m.lecciones.length;
                    }
                }
            }
        }
    }

    const completadas = estudiante.leccionesCompletadas.length;
    if (totalLecciones > 0) {
        estudiante.progreso = Math.round((completadas / totalLecciones) * 100);
        if (estudiante.progreso > 100) estudiante.progreso = 100;
    } else {
        estudiante.progreso = Math.min(100, completadas * 10);
    }

    return await this.estudianteRepo.save(estudiante);
}
}
