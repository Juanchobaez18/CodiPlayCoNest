import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from '../../entities/estudiantes.entity';
import { CreateEstudianteDto, UpdateEstudianteDto } from '../../dtos/estudiante.dto';
import { UsersService } from '../../../users/services/users/users.service';
import { TareaEntrega, EstadoEntregaTarea, ResultadoCalificacion } from '../../../docente/entities/tarea-entrega.entity';
import { Tarea, EstadoTareaEntidad } from '../../../docente/entities/tarea.entity';
import { Docente } from '../../../docente/entities/docente.entity';
import { Lecciones } from '../../../lecciones/entities/lecciones.entity';
import { ProgressGateway } from '../../../progress/progress.gateway';

@Injectable()
export class EstudiantesService {

    constructor(
        @InjectRepository(Estudiante) private estudianteRepo: Repository<Estudiante>,
        @InjectRepository(TareaEntrega) private entregaRepo: Repository<TareaEntrega>,
        @InjectRepository(Tarea) private tareaRepo: Repository<Tarea>,
        @InjectRepository(Docente) private docenteRepo: Repository<Docente>,
        @InjectRepository(Lecciones) private leccionesRepo: Repository<Lecciones>,
        private usersService: UsersService,
        private progressGateway: ProgressGateway,
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
                leccionesCompletadas: {
                    modulo: true
                },
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
        relations: ['cursos', 'cursos.docente'],
    });
    if (!estudiante) throw new NotFoundException(`Estudiante del usuario #${userId} no encontrado`);

    // QueryBuilder with explicit JOINs (TypeORM does not expose FK cols directly in WHERE)
    const entrega = await this.entregaRepo
        .createQueryBuilder('entrega')
        .innerJoin('entrega.estudiante', 'est')
        .innerJoinAndSelect('entrega.tarea', 'tarea')
        .innerJoinAndSelect('tarea.modulo', 'modulo')
        .leftJoinAndSelect('tarea.leccion', 'leccion')
        .leftJoinAndSelect('tarea.docente', 'docente')
        .leftJoinAndSelect('tarea.curso', 'curso')
        .where('est.id = :estudianteId', { estudianteId: estudiante.id })
        .andWhere('modulo.orden = :moduloOrden', { moduloOrden })
        .andWhere('leccion.orden = :leccionOrden', { leccionOrden })
        .getOne();

    if (!entrega) {
        const cursoIds = (estudiante.cursos ?? []).map(c => c.id);

        if (cursoIds.length === 0) {
            return { success: false, completed: false, message: 'No se encontró una tarea asociada a esta lección' };
        }

        const leccion = await this.leccionesRepo
            .createQueryBuilder('leccion')
            .innerJoinAndSelect('leccion.modulo', 'modulo')
            .innerJoinAndSelect('modulo.curso', 'curso')
            .leftJoinAndSelect('curso.docente', 'docente')
            .where('leccion.orden = :leccionOrden', { leccionOrden })
            .andWhere('modulo.orden = :moduloOrden', { moduloOrden })
            .andWhere('curso.id IN (:...cursoIds)', { cursoIds })
            .getOne();

        if (leccion) {
            const modulo = leccion.modulo;
            const curso = modulo.curso;
            const docente = curso.docente;

            // Check if Tarea already exists for another student/docente combination
            let tarea = await this.tareaRepo.findOne({
                where: {
                    curso: { id: curso.id },
                    leccion: { id: leccion.id },
                },
            });

            if (!tarea) {
                tarea = await this.tareaRepo.save(
                    this.tareaRepo.create({
                        titulo: `${modulo.titulo} — ${leccion.titulo}`,
                        descripcion: `Completar la lección "${leccion.titulo}" del módulo "${modulo.titulo}" del curso "${curso.nombre}".`,
                        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        estado: EstadoTareaEntidad.PENDIENTE,
                        docente: docente || undefined,
                        curso,
                        modulo,
                        leccion,
                    }),
                );
            }

            // Create delivery
            const nuevaEntrega = this.entregaRepo.create({
                tarea,
                estudiante,
                estado: EstadoEntregaTarea.ENTREGADO,
                calificacion: null,
                resultado: null,
                fechaEntrega: new Date(),
            });
            await this.entregaRepo.save(nuevaEntrega);

            // Notify teacher via WebSocket so their task list refreshes in real time
            this.progressGateway.emitProgresoActualizado(cursoIds, estudiante.id, {
                estudianteId: estudiante.id,
                progreso: estudiante.progreso ?? 0,
                leccionesCompletadas: estudiante.leccionesCompletadas?.length ?? 0,
            });

            return { success: true, completed: false, message: 'Lección enviada para revisión del docente' };
        }
        return { success: false, completed: false, message: 'No se encontró una lección asociada' };
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

    // Notify teacher via WebSocket so their task list refreshes in real time
    const cursoIds = (estudiante.cursos ?? []).map(c => c.id);
    this.progressGateway.emitProgresoActualizado(cursoIds, estudiante.id, {
        estudianteId: estudiante.id,
        progreso: estudiante.progreso ?? 0,
        leccionesCompletadas: estudiante.leccionesCompletadas?.length ?? 0,
    });

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
        estudiante.leccionesCompletadas = [...estudiante.leccionesCompletadas, { id: leccionId } as any];
        await this.estudianteRepo.save(estudiante);
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

    const saved = await this.estudianteRepo.save(estudiante);

    // Emitir evento WebSocket a docentes y al propio estudiante
    const cursoIds = (estudiante.cursos ?? []).map(c => c.id);
    this.progressGateway.emitProgresoActualizado(cursoIds, estudiante.id, {
      estudianteId: estudiante.id,
      progreso: saved.progreso,
      leccionesCompletadas: saved.leccionesCompletadas.length,
      leccionId,
    });

    return saved;
  }
}
