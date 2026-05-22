import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { DocenteService } from '../../service/docente/docente.service';
import { MensajesService } from 'src/mensajes/service/mensajes.service';
import { Mensaje } from 'src/mensajes/entities/mensaje.entity';
import { RemitenteTipo } from 'src/mensajes/dto/crear-mensaje.dto';

@UseGuards(JwtAuthGuard)
@Controller('docente')
export class DocentePanelController {
  constructor(
    private readonly docenteService: DocenteService,
    private readonly mensajesService: MensajesService,
    @InjectRepository(Mensaje)
    private readonly mensajeRepo: Repository<Mensaje>,
  ) {}

  // 1. GET /docente/dashboard/stats
  @Get('dashboard/stats')
  async getDashboardStats(@Request() req) {
    const userId = req.user.sub || req.user.id;
    const docente = await this.docenteService.findByUserId(userId, [
      'cursos',
      'cursos.estudiantes',
    ]);

    const totalCursos = docente.cursos.length;
    const cursosActivos = docente.cursos.filter((c) => c.estado).length;

    // Conteo de estudiantes únicos
    const uniqueStudents = new Set<number>();
    docente.cursos.forEach((c) => {
      if (c.estudiantes) {
        c.estudiantes.forEach((est) => uniqueStudents.add(est.id));
      }
    });

    return {
      totalCursos,
      cursosActivos,
      totalEstudiantes: uniqueStudents.size,
      tasaCompletacion: 78, // Mockup del porcentaje de completitud
    };
  }

  // 2. GET /docente/cursos
  @Get('cursos')
  async getCursos(@Request() req) {
    const userId = req.user.sub || req.user.id;
    const docente = await this.docenteService.findByUserId(userId, [
      'cursos',
      'cursos.estudiantes',
    ]);

    return docente.cursos.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      descripcion: c.descripcion,
      estudiantes: c.estudiantes ? c.estudiantes.length : 0,
      progreso: 45, // Mockup progreso general del curso
      estado: c.estado,
    }));
  }

  // 3. GET /docente/cursos/:id
  @Get('cursos/:id')
  async getCursoDetalle(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.sub || req.user.id;
    const docente = await this.docenteService.findByUserId(userId, [
      'cursos',
      'cursos.estudiantes',
      'cursos.estudiantes.user',
      'cursos.modulos',
      'cursos.modulos.lecciones',
    ]);

    const curso = docente.cursos.find((c) => c.id === id);
    if (!curso) {
      throw new NotFoundException('Curso no encontrado o no pertenece a este docente');
    }

    const estudiantes = (curso.estudiantes || []).map((est) => ({
      id: est.id,
      nombre: est.user?.name || 'Estudiante',
      apellido: est.user?.lastName || '',
      email: est.user?.email || '',
      progreso: Math.floor(Math.random() * 40) + 40, // Progreso simulado para visualización
      estado: 'en_progreso',
    }));

    const modulos = (curso.modulos || []).map((mod) => ({
      id: mod.id,
      nombre: mod.titulo, // Mapeado de titulo a nombre
      orden: mod.orden,
      lecciones: (mod.lecciones || []).map((lec) => ({
        id: lec.id,
        nombre: lec.titulo, // Mapeado de titulo a nombre
        orden: lec.orden,
      })),
    }));

    return {
      id: curso.id,
      nombre: curso.nombre,
      descripcion: curso.descripcion,
      estado: curso.estado,
      estudiantes,
      modulos,
    };
  }

  // 4. GET /docente/estudiantes
  @Get('estudiantes')
  async getEstudiantes(@Request() req) {
    const userId = req.user.sub || req.user.id;
    const docente = await this.docenteService.findByUserId(userId, [
      'cursos',
      'cursos.estudiantes',
      'cursos.estudiantes.user',
    ]);

    const uniqueStudentsMap = new Map<number, any>();

    docente.cursos.forEach((curso) => {
      if (curso.estudiantes) {
        curso.estudiantes.forEach((est) => {
          if (!uniqueStudentsMap.has(est.id)) {
            uniqueStudentsMap.set(est.id, {
              id: est.id,
              nombre: est.user?.name || 'Estudiante',
              apellido: est.user?.lastName || '',
              email: est.user?.email || '',
              cursos: [],
              progreso: Math.floor(Math.random() * 50) + 30,
            });
          }
          const std = uniqueStudentsMap.get(est.id);
          std.cursos.push(curso.nombre);
        });
      }
    });

    return Array.from(uniqueStudentsMap.values());
  }

  // 5. GET /docente/mensajes
  @Get('mensajes')
  async getMensajes(@Request() req) {
    const userId = req.user.sub || req.user.id;
    const docente = await this.docenteService.findByUserId(userId);

    const mensajes = await this.mensajeRepo.find({
      where: { docente: { id: docente.id } },
      relations: ['estudiante', 'estudiante.user'],
      order: { fecha_envio: 'DESC' },
    });

    return mensajes.map((m) => ({
      id: m.id,
      remitente: m.remitenteTipo === RemitenteTipo.DOCENTE
        ? 'Tú'
        : `${m.estudiante?.user?.name || ''} ${m.estudiante?.user?.lastName || ''}`,
      destinatario: m.remitenteTipo === RemitenteTipo.ESTUDIANTE
        ? 'Tú'
        : `${m.estudiante?.user?.name || ''} ${m.estudiante?.user?.lastName || ''}`,
      asunto: 'Consulta sobre el curso',
      contenido: m.contenido,
      fecha: m.fecha_envio ? m.fecha_envio.toISOString() : new Date().toISOString(),
      leido: m.fecha_lectura != null,
      tipo: m.remitenteTipo === RemitenteTipo.DOCENTE ? 'enviado' : 'recibido',
    }));
  }

  // 6. POST /docente/mensajes
  @Post('mensajes')
  async sendMensaje(@Request() req, @Body() body: { destinatarioId: number; contenido: string }) {
    const userId = req.user.sub || req.user.id;
    const docente = await this.docenteService.findByUserId(userId);

    await this.mensajesService.crear({
      contenido: body.contenido,
      estudianteId: body.destinatarioId,
      docenteId: docente.id,
      remitenteTipo: RemitenteTipo.DOCENTE,
    });

    return { success: true };
  }

  // 7. GET /docente/tareas (Simulado para que no dependa de un esquema inexistente de Tareas)
  @Get('tareas')
  async getTareas(@Request() req) {
    const userId = req.user.sub || req.user.id;
    const docente = await this.docenteService.findByUserId(userId, ['cursos']);
    
    // Generar tareas asociadas a los cursos reales del docente para mejor UX
    const tareas: any[] = [];
    let tareaId = 1;

    docente.cursos.forEach((curso, index) => {
      tareas.push({
        id: tareaId++,
        titulo: `Actividad práctica: ${curso.nombre}`,
        descripcion: `Desarrollar los ejercicios prácticos planteados para el curso ${curso.nombre}.`,
        fechaVencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        fechaCreacion: new Date().toISOString(),
        estudiantes: 4,
        estado: index % 2 === 0 ? 'pendiente' : 'completada',
        modulo: 'Módulo Introductorio',
        leccion: 'Lección Inicial',
        entregas: [
          { id: 201, estudianteNombre: 'Carlos', estudianteApellido: 'Ortiz', estado: 'pendiente', calificacion: 'Pendiente' },
          { id: 202, estudianteNombre: 'Sofía', estudianteApellido: 'Giraldo', estado: 'pendiente', calificacion: 'Pendiente' }
        ]
      });
    });

    return tareas;
  }

  // 8. POST /docente/tareas/calificar (Simulado)
  @Post('tareas/calificar')
  async calificarTarea(@Body() body: { entregaId: number; calificacion: string; resultado: string }) {
    return {
      success: true,
      message: 'Entrega calificada correctamente',
      data: {
        entregaId: body.entregaId,
        calificacion: body.calificacion,
        resultado: body.resultado,
      },
    };
  }

  // 9. POST /docente/subir-foto
  @Post('subir-foto')
  async subirFoto() {
    return {
      success: true,
      message: 'Foto de perfil actualizada correctamente',
      fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    };
  }
}
