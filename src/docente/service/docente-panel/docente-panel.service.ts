import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Docente } from 'src/docente/entities/docente.entity';
import { Curso } from 'src/curso/entity/curso.entity/curso.entity';
import { Estudiante } from 'src/estudiantes/entities/estudiantes.entity';
import { Mensaje } from 'src/mensajes/entities/mensaje.entity';
import {
  DocenteDashboardStatsDto,
  DocenteCursoDto,
  DocenteEstudianteDto,
  DocenteTareaDto,
  DocenteMensajeDto,
  CreateTareaDto,
  SendMensajeDto,
} from '../../dtos/docente-dashboard.dto';
import { RemitenteTipo } from 'src/mensajes/dto/crear-mensaje.dto';

@Injectable()
export class DocentePanelService {
  constructor(
    @InjectRepository(Docente)
    private docenteRepository: Repository<Docente>,

    @InjectRepository(Curso)
    private cursoRepository: Repository<Curso>,

    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,

    @InjectRepository(Mensaje)
    private mensajeRepository: Repository<Mensaje>,
  ) {}

  /**
   * Obtener estadísticas del dashboard del docente
   */
  async getDashboardStats(docenteId: number): Promise<DocenteDashboardStatsDto> {
    // Validar que el docente existe
    const docente = await this.docenteRepository.findOne({
      where: { id: docenteId },
      relations: ['cursos', 'cursos.estudiantes'],
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    // Calcular estadísticas
    const totalCursosActivos = docente.cursos?.filter(c => c.estado).length || 0;
    const totalEstudiantes = docente.cursos?.reduce((acc, curso) => {
      return acc + (curso.estudiantes?.length || 0);
    }, 0) || 0;

    // Calcular tasa de completación (simulado - ajustar según lógica real)
    const tasaCompletacion = totalEstudiantes > 0 ? 75 : 0;

    return {
      totalEstudiantes,
      totalCursosActivos,
      tasaCompletacion,
    };
  }

  /**
   * Obtener cursos del docente
   */
  async getCursos(docenteId: number): Promise<DocenteCursoDto[]> {
    const docente = await this.docenteRepository.findOne({
      where: { id: docenteId },
      relations: ['cursos', 'cursos.estudiantes'],
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    return docente.cursos.map(curso => ({
      id: curso.id,
      nombre: curso.nombre,
      descripcion: curso.descripcion,
      estudiantes: curso.estudiantes?.length || 0,
      progreso: 65, // Simulado - calcular según progreso real
      estado: curso.estado,
    }));
  }

  /**
   * Obtener estudiantes del docente
   */
  async getEstudiantes(docenteId: number): Promise<DocenteEstudianteDto[]> {
    const docente = await this.docenteRepository.findOne({
      where: { id: docenteId },
      relations: ['cursos', 'cursos.estudiantes', 'cursos.estudiantes.user'],
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    const estudiantes: Map<number, DocenteEstudianteDto> = new Map();

    // Recopilar estudiantes únicos de todos los cursos del docente
    docente.cursos.forEach(curso => {
      curso.estudiantes?.forEach(est => {
        if (!estudiantes.has(est.id)) {
          estudiantes.set(est.id, {
            id: est.id,
            nombre: est.user?.name || 'Desconocido',
            apellido: est.user?.lastName || '',
            email: est.user?.email || '',
            cursos: [],
            progreso: 50, // Simulado
          });
        }
        // Agregar curso a la lista
        const dto = estudiantes.get(est.id);
        if (dto?.cursos) {
          dto.cursos.push(curso.nombre);
        }
      });
    });

    return Array.from(estudiantes.values());
  }

  /**
   * Obtener tareas del docente (simulado)
   */
  async getTareas(docenteId: number): Promise<DocenteTareaDto[]> {
    // Validar que el docente existe
    const docente = await this.docenteRepository.findOne({
      where: { id: docenteId },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    // Simulado - en una implementación real, tendrías una entidad Tarea
    return [
      {
        id: 1,
        titulo: 'Tarea 1: Introducción a Angular',
        descripcion: 'Implementar un componente básico en Angular',
        fechaVencimiento: '2026-05-20',
        estudiantes: 15,
        estado: 'pendiente',
      },
      {
        id: 2,
        titulo: 'Tarea 2: Servicios HTTP',
        descripcion: 'Crear un servicio HTTP para consumir APIs',
        fechaVencimiento: '2026-05-18',
        estudiantes: 12,
        estado: 'vencida',
      },
      {
        id: 3,
        titulo: 'Tarea 3: Forms Reactivos',
        descripcion: 'Implementar un formulario reactivo con validaciones',
        fechaVencimiento: '2026-05-25',
        estudiantes: 18,
        estado: 'completada',
      },
    ];
  }

  /**
   * Obtener mensajes del docente
   */
  async getMensajes(docenteId: number): Promise<DocenteMensajeDto[]> {
    const docente = await this.docenteRepository.findOne({
      where: { id: docenteId },
      relations: ['mensajes', 'mensajes.estudiante', 'mensajes.estudiante.user'],
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    return (docente.mensajes || []).map(msg => ({
      id: msg.id,
      remitente: msg.estudiante?.user?.name || 'Sistema',
      asunto: msg.contenido?.substring(0, 50) || 'Sin asunto',
      fecha: msg.fecha_envio?.toISOString() || new Date().toISOString(),
      leido: msg.fecha_lectura ? true : false,
    }));
  }

  /**
   * Obtener foros del docente (simplificado)
   */
  async getForos(docenteId: number) {
    const docente = await this.docenteRepository.findOne({
      where: { id: docenteId },
      relations: ['foros'],
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    return docente.foros || [];
  }

  /**
   * Actualizar un curso del docente
   */
  async updateCurso(
    docenteId: number,
    cursoId: number,
    data: any,
  ) {
    const curso = await this.cursoRepository.findOne({
      where: { id: cursoId },
      relations: ['docente'],
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Verificar que el docente es el dueño del curso
    if (curso.docente.id !== docenteId) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar este curso',
      );
    }

    Object.assign(curso, data);
    return this.cursoRepository.save(curso);
  }

  /**
   * Crear una tarea (simulado)
   */
  async createTarea(docenteId: number, data: CreateTareaDto) {
    // Validar que el docente existe
    const docente = await this.docenteRepository.findOne({
      where: { id: docenteId },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    // Simulado - en producción, guardar en base de datos
    return {
      id: Math.floor(Math.random() * 1000),
      ...data,
      estado: 'pendiente',
    };
  }

  /**
   * Enviar mensaje
   */
  async sendMensaje(docenteId: number, data: SendMensajeDto) {
    const docente = await this.docenteRepository.findOne({
      where: { id: docenteId },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    // Crear mensaje
   const mensaje = this.mensajeRepository.create({
  remitenteTipo: RemitenteTipo.DOCENTE,
  contenido: data.mensaje,
  docente,
    });

    return this.mensajeRepository.save(mensaje);
  }

  /**
   * Obtener detalles de un curso específico
   */
  async getCursoDetalle(docenteId: number, cursoId: number) {
    const curso = await this.cursoRepository.findOne({
      where: { id: cursoId },
      relations: ['docente', 'docente.user', 'estudiantes', 'estudiantes.user'],
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Verificar que el docente es el dueño del curso
    if (curso.docente.id !== docenteId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este curso',
      );
    }

    return {
      id: curso.id,
      nombre: curso.nombre,
      descripcion: curso.descripcion,
      dificultad: curso.dificultad,
      precio: curso.precio,
      estado: curso.estado,
      estudiantes: curso.estudiantes?.map(est => ({
        id: est.id,
        nombre: est.user?.name || 'Desconocido',
        apellido: est.user?.lastName || '',
        email: est.user?.email || '',
        progreso: est.progreso || 0,
      })),
      progreso: this.calcularProgresoCurso(curso),
    };
  }

  /**
   * Helper: Calcular progreso promedio
   */
  private calcularProgresoCurso(curso: Curso): number {
    if (!curso.estudiantes || curso.estudiantes.length === 0) {
      return 0;
    }

    const sumaProgreso = curso.estudiantes.reduce((sum, est) => {
      return sum + (est.progreso || 0);
    }, 0);

    return Math.round(sumaProgreso / curso.estudiantes.length);
  }
}
