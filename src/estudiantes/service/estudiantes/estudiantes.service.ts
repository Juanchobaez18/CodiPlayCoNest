import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from '../../entities/estudiantes.entity';
import { CreateEstudianteDto, UpdateEstudianteDto } from '../../dtos/estudiante.dto';
import { UsersService } from '../../../users/services/users/users.service';
import {
  LeccionProgreso,
  EstadoLeccionProgreso,
} from '../../../docente/entities/leccion-progreso.entity';
import { Lecciones } from '../../../lecciones/entities/lecciones.entity';

@Injectable()
export class EstudiantesService {

    constructor(
        @InjectRepository(Estudiante) private estudianteRepo: Repository<Estudiante>,
        @InjectRepository(LeccionProgreso) private leccionProgresoRepo: Repository<LeccionProgreso>,
        @InjectRepository(Lecciones) private leccionesRepo: Repository<Lecciones>,
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
            mensajes: true,
        },
    });
    if (!estudiante) throw new NotFoundException(`Estudiante del usuario #${userId} no encontrado`);
    return estudiante;
}

    async completarLeccion(userId: number, leccionId: number) {
        const estudiante = await this.estudianteRepo.findOne({
            where: { user: { id: userId } },
            relations: ['cursos', 'cursos.modulos', 'cursos.modulos.lecciones'],
        });
        if (!estudiante) {
            throw new NotFoundException('Estudiante no encontrado');
        }

        const tieneAcceso = (estudiante.cursos ?? [])
            .flatMap(c => c.modulos ?? [])
            .flatMap(m => m.lecciones ?? [])
            .some(l => l.id === leccionId);

        if (!tieneAcceso) {
            throw new BadRequestException('No tienes acceso a esta lección o no existe');
        }

        const existente = await this.leccionProgresoRepo.findOne({
            where: { estudiante: { id: estudiante.id }, leccion: { id: leccionId } },
        });

        if (existente?.estado === EstadoLeccionProgreso.APROBADO) {
            throw new BadRequestException('Esta lección ya fue aprobada por el docente');
        }
        if (existente?.estado === EstadoLeccionProgreso.PENDIENTE) {
            return {
                message: 'Tu solicitud ya está pendiente de revisión por el docente',
                progresoId: existente.id,
                estado: existente.estado,
            };
        }

        const leccion = await this.leccionesRepo.findOne({ where: { id: leccionId } });
        if (!leccion) throw new NotFoundException(`Lección #${leccionId} no encontrada`);

        if (existente) {
            existente.estado = EstadoLeccionProgreso.PENDIENTE;
            existente.comentario = null;
            existente.fechaRevision = null;
            const guardado = await this.leccionProgresoRepo.save(existente);
            return {
                message: 'Lección marcada como completada. Esperando aprobación del docente.',
                progresoId: guardado.id,
                estado: guardado.estado,
            };
        }

        const progreso = this.leccionProgresoRepo.create({
            estudiante,
            leccion,
            estado: EstadoLeccionProgreso.PENDIENTE,
        });
        const guardado = await this.leccionProgresoRepo.save(progreso);
        return {
            message: 'Lección marcada como completada. Esperando aprobación del docente.',
            progresoId: guardado.id,
            estado: guardado.estado,
        };
    }
}
