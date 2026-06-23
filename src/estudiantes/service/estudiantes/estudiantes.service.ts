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
import {
  TareaEntrega,
  EstadoEntregaTarea,
  ResultadoCalificacion,
} from '../../../docente/entities/tarea-entrega.entity';
import { Lecciones } from '../../../lecciones/entities/lecciones.entity';

@Injectable()
export class EstudiantesService {

    constructor(
        @InjectRepository(Estudiante) private estudianteRepo: Repository<Estudiante>,
        @InjectRepository(LeccionProgreso) private leccionProgresoRepo: Repository<LeccionProgreso>,
        @InjectRepository(Lecciones) private leccionesRepo: Repository<Lecciones>,
        @InjectRepository(TareaEntrega) private entregaRepo: Repository<TareaEntrega>,
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

    const tareasEntregas = await this.entregaRepo.find({
        where: { estudiante: { id: estudiante.id } },
        relations: {
            tarea: {
                leccion: { modulo: true },
                modulo: true,
            },
        },
    });

    return {
        ...estudiante,
        tareasEntregas: tareasEntregas.map((e) => ({
            id: e.id,
            resultado: e.resultado,
            estado: e.estado,
            tarea: e.tarea
                ? {
                      id: e.tarea.id,
                      titulo: e.tarea.titulo,
                      leccion: e.tarea.leccion
                          ? {
                                id: e.tarea.leccion.id,
                                titulo: e.tarea.leccion.titulo,
                                orden: Number(e.tarea.leccion.orden),
                            }
                          : null,
                      modulo: e.tarea.modulo
                          ? {
                                id: e.tarea.modulo.id,
                                titulo: e.tarea.modulo.titulo,
                                orden: e.tarea.modulo.orden,
                            }
                          : null,
                  }
                : null,
        })),
    };
}

async marcarTareaEntregada(userId: number, moduloOrden: number, leccionOrden: number) {
    const estudiante = await this.estudianteRepo.findOne({
        where: { user: { id: userId } },
    });
    if (!estudiante) throw new NotFoundException(`Estudiante del usuario #${userId} no encontrado`);

    // QueryBuilder with explicit JOINs (TypeORM does not expose FK cols directly in WHERE)
    const entrega = await this.entregaRepo
        .createQueryBuilder('entrega')
        .innerJoin('entrega.estudiante', 'est')
        .innerJoinAndSelect('entrega.tarea', 'tarea')
        .innerJoinAndSelect('tarea.modulo', 'modulo')
        .leftJoinAndSelect('tarea.leccion', 'leccion')
        .where('est.id = :estudianteId', { estudianteId: estudiante.id })
        .andWhere('modulo.orden = :moduloOrden', { moduloOrden })
        .andWhere('leccion.orden = :leccionOrden', { leccionOrden: String(leccionOrden) })
        .getOne();

    if (!entrega) {
        // Sin gate de docente: buscar la lección dentro de los cursos inscritos del estudiante
        const estudianteConCursos = await this.estudianteRepo.findOne({
            where: { id: estudiante.id },
            relations: ['cursos'],
        });
        const cursoIds = estudianteConCursos?.cursos.map(c => c.id) ?? [];

        if (cursoIds.length === 0) {
            return { success: false, completed: false, message: 'No se encontró una tarea asociada a esta lección' };
        }

        const leccion = await this.leccionesRepo
            .createQueryBuilder('leccion')
            .innerJoin('leccion.modulo', 'modulo')
            .innerJoin('modulo.curso', 'curso')
            .where('leccion.orden = :leccionOrden', { leccionOrden: String(leccionOrden) })
            .andWhere('modulo.orden = :moduloOrden', { moduloOrden })
            .andWhere('curso.id IN (:...cursoIds)', { cursoIds })
            .getOne();

        if (leccion) {
            await this.marcarLeccionCompletada(userId, leccion.id);
            return { success: true, completed: true, message: 'Lección completada exitosamente' };
        }
        return { success: false, completed: false, message: 'No se encontró una tarea asociada a esta lección' };
    }

    if (
        entrega.estado === EstadoEntregaTarea.CALIFICADO &&
        entrega.resultado === ResultadoCalificacion.NO_APROBADO
    ) {
        // Student is re-submitting after rejection — reset so teacher can review again
        entrega.estado = EstadoEntregaTarea.ENTREGADO;
        entrega.resultado = null;
        entrega.calificacion = null;
        entrega.fechaEntrega = new Date();
        await this.entregaRepo.save(entrega);
    } else if (entrega.estado !== EstadoEntregaTarea.CALIFICADO) {
        entrega.estado = EstadoEntregaTarea.ENTREGADO;
        if (!entrega.fechaEntrega) {
            entrega.fechaEntrega = new Date();
        }
        await this.entregaRepo.save(entrega);
    }
    // If already calificado + APROBADO: nothing to do (shouldn't re-submit an approved lesson)

    return { success: true, message: 'Lección enviada para revisión del docente' };
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
