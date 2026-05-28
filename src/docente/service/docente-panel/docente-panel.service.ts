import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { Docente } from '../../entities/docente.entity';
import { Curso } from 'src/curso/entity/curso.entity/curso.entity';
import { Estudiante } from 'src/estudiantes/entities/estudiantes.entity';
import { Mensaje } from 'src/mensajes/entities/mensaje.entity';
import { Forum } from 'src/foros/entities/forum.entity';
import { ForoRespuesta } from 'src/foros/entities/foro_respuesta.entity';
import { Tarea, EstadoTareaEntidad } from '../../entities/tarea.entity';
import {
  TareaEntrega,
  EstadoEntregaTarea,
} from '../../entities/tarea-entrega.entity';
import { User } from 'src/users/entities/user.entity';
import {
  RemitenteTipo,
  MensajeEstado,
} from 'src/mensajes/dto/crear-mensaje.dto';
import {
  SendMensajePanelDto,
  CalificarTareaDto,
  CreateForoPanelDto,
  UpdateForoPanelDto,
} from '../../dtos/docente-panel-api.dto';
import { Modulos } from 'src/modulos/entities/modulos.entity';

type EstadoProgresoEstudiante = 'completado' | 'en_progreso' | 'iniciando';

@Injectable()
export class DocentePanelService {
  constructor(
    @InjectRepository(Docente)
    private readonly docenteRepository: Repository<Docente>,
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Mensaje)
    private readonly mensajeRepository: Repository<Mensaje>,
    @InjectRepository(Forum)
    private readonly forumRepository: Repository<Forum>,
    @InjectRepository(ForoRespuesta)
    private readonly foroRespuestaRepository: Repository<ForoRespuesta>,
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,
    @InjectRepository(TareaEntrega)
    private readonly entregaRepository: Repository<TareaEntrega>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Modulos)
    private readonly moduloRepository: Repository<Modulos>,
  ) {}

  private async assertDocente(docenteId: number): Promise<Docente> {
    const docente = await this.docenteRepository.findOne({
      where: { id: docenteId },
      relations: ['user'],
    });
    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }
    return docente;
  }

  private async assertCursoDelDocente(
    docenteId: number,
    cursoId: number,
  ): Promise<Curso> {
    const curso = await this.cursoRepository.findOne({
      where: { id: cursoId, docente: { id: docenteId } },
      relations: ['docente', 'estudiantes', 'estudiantes.user', 'modulos', 'modulos.lecciones'],
    });
    if (!curso) {
      throw new NotFoundException('Curso no encontrado o sin acceso');
    }
    return curso;
  }

  private nombreCompleto(user?: User | null): string {
    if (!user) return 'Usuario';
    return `${user.name ?? ''} ${user.lastName ?? ''}`.trim() || 'Usuario';
  }

  private estadoProgreso(progreso: number): EstadoProgresoEstudiante {
    if (progreso >= 100) return 'completado';
    if (progreso > 0) return 'en_progreso';
    return 'iniciando';
  }

  private calcularPosicionModulo(
    progreso: number,
    modulos: Modulos[],
  ): {
    moduloActual?: string;
    leccionActual?: string;
    progresoModulo?: number;
  } {
    const ordenados = [...modulos].sort((a, b) => a.orden - b.orden);
    const leccionesTotales = ordenados.reduce(
      (acc, m) => acc + (m.lecciones?.length ?? 0),
      0,
    );
    if (!leccionesTotales) {
      return {};
    }

    const leccionesCompletadas = Math.floor(
      (Math.min(100, Math.max(0, progreso)) / 100) * leccionesTotales,
    );
    let contador = 0;

    for (const modulo of ordenados) {
      const lecciones = [...(modulo.lecciones ?? [])].sort(
        (a, b) => Number(a.orden) - Number(b.orden),
      );
      for (const leccion of lecciones) {
        if (contador >= leccionesCompletadas) {
          const progresoModulo =
            lecciones.length > 0
              ? Math.round(
                  ((leccionesCompletadas - (contador - lecciones.indexOf(leccion))) /
                    lecciones.length) *
                    100,
                )
              : 0;
          return {
            moduloActual: modulo.titulo,
            leccionActual: leccion.titulo,
            progresoModulo: Math.min(100, Math.max(0, progresoModulo || progreso)),
          };
        }
        contador++;
      }
    }

    const ultimo = ordenados[ordenados.length - 1];
    const ultimaLeccion = ultimo?.lecciones?.[ultimo.lecciones.length - 1];
    return {
      moduloActual: ultimo?.titulo,
      leccionActual: ultimaLeccion?.titulo,
      progresoModulo: 100,
    };
  }

  async getDashboardStats(docenteId: number) {
    await this.assertDocente(docenteId);
    const cursos = await this.cursoRepository.find({
      where: { docente: { id: docenteId }, estado: true },
      relations: ['estudiantes'],
    });

    const estudianteIds = new Set<number>();
    let sumaProgreso = 0;
    let contadorProgreso = 0;

    for (const curso of cursos) {
      for (const est of curso.estudiantes ?? []) {
        estudianteIds.add(est.id);
        sumaProgreso += est.progreso ?? 0;
        contadorProgreso++;
      }
    }

    const tasaCompletacion =
      contadorProgreso > 0
        ? Math.round((sumaProgreso / contadorProgreso) * 10) / 10
        : 0;

    return {
      totalEstudiantes: estudianteIds.size,
      totalCursosActivos: cursos.length,
      tasaCompletacion,
    };
  }

  async getCursos(docenteId: number, estadoFilter?: boolean) {
    await this.assertDocente(docenteId);
    const where: Record<string, unknown> = { docente: { id: docenteId } };
    if (estadoFilter !== undefined) {
      where.estado = estadoFilter;
    }

    const cursos = await this.cursoRepository.find({
      where,
      relations: ['estudiantes'],
      order: { id: 'ASC' },
    });

    return cursos.map((curso) => ({
      id: curso.id,
      nombre: curso.nombre,
      descripcion: curso.descripcion,
      estudiantes: curso.estudiantes?.length ?? 0,
      progreso: this.calcularProgresoPromedio(curso.estudiantes ?? []),
      estado: curso.estado,
    }));
  }

  async getCursoDetalle(docenteId: number, cursoId: number) {
    const curso = await this.assertCursoDelDocente(docenteId, cursoId);
    const modulosOrdenados = [...(curso.modulos ?? [])].sort(
      (a, b) => a.orden - b.orden,
    );

    const estudiantes = (curso.estudiantes ?? []).map((est) => {
      const progreso = est.progreso ?? 0;
      const posicion = this.calcularPosicionModulo(progreso, modulosOrdenados);
      const estado = this.estadoProgreso(progreso);
      return {
        id: est.id,
        nombre: est.user?.name ?? 'Desconocido',
        apellido: est.user?.lastName ?? '',
        email: est.user?.email ?? '',
        progreso,
        estado,
        moduloActual: estado === 'completado' ? null : posicion.moduloActual,
        leccionActual: estado === 'completado' ? null : posicion.leccionActual,
        progresoModulo:
          estado === 'completado' ? 100 : (posicion.progresoModulo ?? progreso),
      };
    });

    return {
      id: curso.id,
      nombre: curso.nombre,
      descripcion: curso.descripcion,
      estado: curso.estado,
      estudiantes,
      modulos: modulosOrdenados.map((modulo) => ({
        id: modulo.id,
        nombre: modulo.titulo,
        orden: modulo.orden,
        lecciones: [...(modulo.lecciones ?? [])]
          .sort((a, b) => Number(a.orden) - Number(b.orden))
          .map((leccion) => ({
            id: leccion.id,
            nombre: leccion.titulo,
            orden: Number(leccion.orden),
          })),
      })),
    };
  }

  async getEstudiantes(docenteId: number, cursoId?: number) {
    await this.assertDocente(docenteId);
    const cursos = await this.cursoRepository.find({
      where: cursoId
        ? { docente: { id: docenteId }, id: cursoId }
        : { docente: { id: docenteId } },
      relations: ['estudiantes', 'estudiantes.user'],
    });

    const map = new Map<
      number,
      {
        id: number;
        nombre: string;
        apellido: string;
        email: string;
        cursos: string[];
        progresoTotal: number;
        contador: number;
      }
    >();

    for (const curso of cursos) {
      for (const est of curso.estudiantes ?? []) {
        if (!map.has(est.id)) {
          map.set(est.id, {
            id: est.id,
            nombre: est.user?.name ?? 'Desconocido',
            apellido: est.user?.lastName ?? '',
            email: est.user?.email ?? '',
            cursos: [],
            progresoTotal: 0,
            contador: 0,
          });
        }
        const row = map.get(est.id)!;
        row.cursos.push(curso.nombre);
        row.progresoTotal += est.progreso ?? 0;
        row.contador++;
      }
    }

    return Array.from(map.values()).map((row) => ({
      id: row.id,
      nombre: row.nombre,
      apellido: row.apellido,
      email: row.email,
      cursos: row.cursos,
      progreso:
        row.contador > 0 ? Math.round(row.progresoTotal / row.contador) : 0,
    }));
  }

  async getTareas(docenteId: number, cursoId?: number) {
    await this.assertDocente(docenteId);

    // Ensure every course owned by this docente has at least one task,
    // and every enrolled student has a delivery record.
    await this.ensureTareasParaCursos(docenteId, cursoId);

    const where: Record<string, unknown> = { docente: { id: docenteId } };
    if (cursoId) {
      where.curso = { id: cursoId };
    }

    return (
      await this.tareaRepository.find({
        where,
        relations: [
          'curso',
          'modulo',
          'leccion',
          'entregas',
          'entregas.estudiante',
          'entregas.estudiante.user',
        ],
        order: { fechaVencimiento: 'DESC' },
      })
    ).map((tarea) => this.mapTareaResponse(tarea));
  }

  private async ensureTareasParaCursos(docenteId: number, cursoId?: number) {
    const docente = await this.assertDocente(docenteId);

    const cursosWhere: Record<string, unknown> = { docente: { id: docenteId } };
    if (cursoId) cursosWhere.id = cursoId;

    const cursos = await this.cursoRepository.find({
      where: cursosWhere,
      relations: ['estudiantes', 'modulos', 'modulos.lecciones'],
    });

    for (const curso of cursos) {
      // Create a task for this course if none exists yet
      const tareaExistente = await this.tareaRepository.findOne({
        where: { docente: { id: docenteId }, curso: { id: curso.id } },
        relations: ['entregas', 'entregas.estudiante'],
      });

      let tarea: Tarea;
      if (!tareaExistente) {
        const modulo = [...(curso.modulos ?? [])].sort((a, b) => a.orden - b.orden)[0];
        const leccion = modulo?.lecciones?.[0];
        tarea = await this.tareaRepository.save(
          this.tareaRepository.create({
            titulo: modulo
              ? `Actividad: ${modulo.titulo}`
              : `Inscripción: ${curso.nombre}`,
            descripcion: leccion
              ? `Completar la lección "${leccion.titulo}" del módulo ${modulo!.titulo}.`
              : modulo
              ? `Actividad del módulo ${modulo.titulo} en ${curso.nombre}.`
              : `Revisar y aprobar la inscripción de los estudiantes al curso "${curso.nombre}".`,
            fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            estado: EstadoTareaEntidad.PENDIENTE,
            docente,
            curso,
            modulo: modulo ?? null,
            leccion: leccion ?? null,
          }),
        );
      } else {
        tarea = tareaExistente;
      }

      // Always sync enrolled students so late-enrollers appear
      await this.syncEntregasTarea(tarea, curso.estudiantes ?? []);
    }
  }

  async calificarTarea(docenteId: number, dto: CalificarTareaDto) {
    await this.assertDocente(docenteId);
    const entrega = await this.entregaRepository.findOne({
      where: { id: dto.entregaId },
      relations: ['tarea', 'tarea.docente', 'estudiante'],
    });

    if (!entrega) {
      throw new NotFoundException('Entrega no encontrada');
    }
    if (entrega.tarea.docente.id !== docenteId) {
      throw new ForbiddenException('No puede calificar entregas de otro docente');
    }

    entrega.estado = EstadoEntregaTarea.CALIFICADO;
    entrega.calificacion = dto.calificacion;
    entrega.resultado = dto.resultado;
    if (!entrega.fechaEntrega) {
      entrega.fechaEntrega = new Date();
    }

    await this.entregaRepository.save(entrega);

    const pendientes = await this.entregaRepository.count({
      where: {
        tarea: { id: entrega.tarea.id },
        estado: In([
          EstadoEntregaTarea.ENTREGADO,
          EstadoEntregaTarea.NO_ENTREGADO,
        ]),
      },
    });
    if (pendientes === 0) {
      entrega.tarea.estado = EstadoTareaEntidad.CALIFICADA;
      await this.tareaRepository.save(entrega.tarea);
    }

    return {
      success: true,
      message: 'Tarea calificada exitosamente',
      entrega: {
        id: entrega.id,
        estado: entrega.estado,
        calificacion: entrega.calificacion,
      },
    };
  }

  async getMensajes(
    docenteId: number,
    tipo: 'enviado' | 'recibido' | 'todos' = 'todos',
  ) {
    const docente = await this.assertDocente(docenteId);
    const nombreDocente = this.nombreCompleto(docente.user);

    const mensajes = await this.mensajeRepository.find({
      where: { docente: { id: docenteId } },
      relations: ['estudiante', 'estudiante.user'],
      order: { fecha_envio: 'DESC' },
    });

    const mapped = mensajes.map((msg) => {
      const nombreEstudiante = this.nombreCompleto(msg.estudiante?.user);
      const esEnviado = msg.remitenteTipo === RemitenteTipo.DOCENTE;
      return {
        id: msg.id,
        remitente: esEnviado ? nombreDocente : nombreEstudiante,
        destinatario: esEnviado ? nombreEstudiante : nombreDocente,
        asunto: msg.contenido.substring(0, 80) || 'Sin asunto',
        contenido: msg.contenido,
        fecha: msg.fecha_envio?.toISOString() ?? new Date().toISOString(),
        leido: Boolean(msg.fecha_lectura) || msg.estado === MensajeEstado.LEIDO,
        tipo: esEnviado ? ('enviado' as const) : ('recibido' as const),
      };
    });

    if (tipo === 'enviado') {
      return mapped.filter((m) => m.tipo === 'enviado');
    }
    if (tipo === 'recibido') {
      return mapped.filter((m) => m.tipo === 'recibido');
    }
    return mapped;
  }

  async sendMensaje(docenteId: number, dto: SendMensajePanelDto) {
    const docente = await this.assertDocente(docenteId);
    const estudiante = await this.estudianteRepository.findOne({
      where: { id: dto.destinatarioId },
      relations: ['user', 'cursos', 'cursos.docente'],
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const pertenece = (estudiante.cursos ?? []).some(
      (c) => c.docente?.id === docenteId,
    );
    if (!pertenece) {
      throw new ForbiddenException(
        'El estudiante no pertenece a ningún curso de este docente',
      );
    }

    const mensaje = this.mensajeRepository.create({
      contenido: dto.contenido,
      remitenteTipo: RemitenteTipo.DOCENTE,
      docente,
      estudiante,
      estado: MensajeEstado.ENVIADO,
    });
    const guardado = await this.mensajeRepository.save(mensaje);

    return {
      id: guardado.id,
      remitente: this.nombreCompleto(docente.user),
      destinatario: this.nombreCompleto(estudiante.user),
      contenido: guardado.contenido,
      fecha: guardado.fecha_envio?.toISOString() ?? new Date().toISOString(),
      tipo: 'enviado' as const,
    };
  }

  async getForos(docenteId: number, cursoId?: number) {
    await this.assertDocente(docenteId);
    const where: Record<string, unknown> = { docente: { id: docenteId } };
    if (cursoId) {
      where.curso = { id: cursoId };
    }

    const foros = await this.forumRepository.find({
      where,
      relations: ['curso', 'respuestas'],
      order: { fecha_creacion: 'DESC' },
    });

    return foros.map((foro) => this.mapForoResponse(foro));
  }

  async getForoById(docenteId: number, foroId: number) {
    const foro = await this.forumRepository.findOne({
      where: { id: foroId },
      relations: ['docente', 'curso', 'respuestas'],
    });
    if (!foro) {
      throw new NotFoundException('Foro no encontrado');
    }
    if (foro.docente?.id !== docenteId) {
      throw new ForbiddenException('No tiene acceso a este foro');
    }
    return this.mapForoResponse(foro);
  }

  async createForo(docenteId: number, dto: CreateForoPanelDto) {
    const docente = await this.assertDocente(docenteId);
    const curso = await this.assertCursoDelDocente(docenteId, dto.cursoId);

    const foro = this.forumRepository.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      docente,
      curso,
    });
    const guardado = await this.forumRepository.save(foro);
    guardado.curso = curso;
    return this.mapForoResponse(guardado);
  }

  async updateForo(docenteId: number, foroId: number, dto: UpdateForoPanelDto) {
    const foro = await this.forumRepository.findOne({
      where: { id: foroId },
      relations: ['docente', 'curso', 'respuestas'],
    });
    if (!foro) {
      throw new NotFoundException('Foro no encontrado');
    }
    if (foro.docente?.id !== docenteId) {
      throw new ForbiddenException('Solo el creador puede editar el foro');
    }
    if (!dto.titulo && !dto.descripcion) {
      throw new BadRequestException(
        'Debe proporcionar al menos titulo o descripcion',
      );
    }
    if (dto.titulo) foro.titulo = dto.titulo;
    if (dto.descripcion) foro.descripcion = dto.descripcion;
    const guardado = await this.forumRepository.save(foro);
    return this.mapForoResponse(guardado);
  }

  async deleteForo(docenteId: number, foroId: number) {
    const foro = await this.forumRepository.findOne({
      where: { id: foroId },
      relations: ['docente'],
    });
    if (!foro) {
      throw new NotFoundException('Foro no encontrado');
    }
    if (foro.docente?.id !== docenteId) {
      throw new ForbiddenException('Solo el creador puede eliminar el foro');
    }
    await this.foroRespuestaRepository.delete({ foro: { id: foroId } });
    await this.forumRepository.delete(foroId);
    return { success: true, message: 'Foro eliminado exitosamente' };
  }

  async getForoRespuestas(docenteId: number, foroId: number) {
    const foro = await this.forumRepository.findOne({
      where: { id: foroId },
      relations: ['docente'],
    });
    if (!foro) {
      throw new NotFoundException('Foro no encontrado');
    }
    if (foro.docente?.id !== docenteId) {
      throw new ForbiddenException('No tiene acceso a este foro');
    }

    const respuestas = await this.foroRespuestaRepository.find({
      where: { foro: { id: foroId } },
      relations: ['estudiante', 'estudiante.user', 'docente', 'docente.user'],
      order: { fecha_creacion: 'ASC' },
    });

    return respuestas.map((r) => ({
      id: r.id,
      mensaje: r.contenido,
      estudianteNombre: r.docente ? (r.docente.user?.name ?? 'Docente') : (r.estudiante?.user?.name ?? 'Anónimo'),
      estudianteApellido: r.docente ? (r.docente.user?.lastName ?? '') : (r.estudiante?.user?.lastName ?? ''),
      esDocente: !!r.docente,
      docenteId: r.docente?.id,
      estudianteId: r.estudiante?.id,
      fechaCreacion: r.fecha_creacion?.toISOString() ?? new Date().toISOString(),
    }));
  }

  async uploadFotoPerfil(
    userId: number,
    file: { buffer: Buffer; mimetype: string; size: number; originalname: string },
  ) {
    if (!file) {
      throw new BadRequestException('Debe enviar un archivo en el campo "foto"');
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de archivo no permitido. Use JPEG, PNG o WebP',
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('El archivo no puede superar 5MB');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'docentes');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `${userId}-${Date.now()}.${ext}`;
    await writeFile(join(uploadsDir, filename), file.buffer);

    const url = `/uploads/docentes/${filename}`;
    user.avatar = url;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Imagen subida correctamente',
      fotoPerfil: {
        url,
        uploadedAt: new Date().toISOString(),
      },
    };
  }

  /** Sincroniza entregas de tareas para estudiantes inscritos (idempotente). */
  private async syncEntregasTarea(tarea: Tarea, estudiantes: Estudiante[]) {
    for (const estudiante of estudiantes) {
      const existe = await this.entregaRepository.findOne({
        where: { tarea: { id: tarea.id }, estudiante: { id: estudiante.id } },
      });
      if (!existe) {
        await this.entregaRepository.save(
          this.entregaRepository.create({
            tarea,
            estudiante,
            estado: EstadoEntregaTarea.NO_ENTREGADO,
            calificacion: null,
            resultado: null,
            fechaEntrega: null,
          }),
        );
      }
    }
  }

  private mapTareaResponse(tarea: Tarea) {
    const ahora = new Date();
    let estado = tarea.estado;
    if (
      estado === EstadoTareaEntidad.PENDIENTE &&
      tarea.fechaVencimiento < ahora
    ) {
      estado = EstadoTareaEntidad.VENCIDA;
    }

    return {
      id: tarea.id,
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      fechaVencimiento: tarea.fechaVencimiento.toISOString(),
      fechaCreacion: tarea.fechaCreacion?.toISOString(),
      estudiantes: tarea.entregas?.length ?? 0,
      estado,
      modulo: tarea.modulo?.titulo,
      leccion: tarea.leccion?.titulo,
      cursoId: tarea.curso?.id,
      cursoNombre: tarea.curso?.nombre,
      entregas: (tarea.entregas ?? []).map((e) => ({
        id: e.id,
        estudianteNombre: e.estudiante?.user?.name ?? 'Estudiante',
        estudianteApellido: e.estudiante?.user?.lastName ?? '',
        estado: e.estado,
        calificacion: e.calificacion,
        resultado: e.resultado,
      })),
    };
  }

  private mapForoResponse(foro: Forum) {
    return {
      id: foro.id,
      titulo: foro.titulo,
      descripcion: foro.descripcion,
      cursoId: foro.curso?.id ?? 0,
      cursoNombre: foro.curso?.nombre,
      fechaCreacion: foro.fecha_creacion?.toISOString(),
      cantidadRespuestas: foro.respuestas?.length ?? 0,
    };
  }

  private calcularProgresoPromedio(estudiantes: Estudiante[]): number {
    if (!estudiantes.length) return 0;
    const suma = estudiantes.reduce((acc, e) => acc + (e.progreso ?? 0), 0);
    return Math.round(suma / estudiantes.length);
  }
}
