import {
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  IsDate,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsDateString,
  ArrayNotEmpty,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// ============================================================================
// ENUMS
// ============================================================================

export enum EstadoTarea {
  PENDIENTE = 'pendiente',
  EN_PROGRESO = 'en_progreso',
  COMPLETADA = 'completada',
  VENCIDA = 'vencida',
  CANCELADA = 'cancelada',
}

export enum EstadoCurso {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  PAUSADO = 'pausado',
  FINALIZADO = 'finalizado',
}

export enum TipoPrioridad {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  URGENTE = 'urgente',
}

export enum TipoCalificacion {
  NUMERICA = 'numerica',
  PORCENTUAL = 'porcentual',
  LITERAL = 'literal',
}

// ============================================================================
// DASHBOARD DTOs
// ============================================================================

export class DocenteDashboardStatsDto {
  @ApiProperty({ description: 'Total de estudiantes activos' })
  @IsNumber()
  totalEstudiantes: number;

  @ApiProperty({ description: 'Total de cursos activos' })
  @IsNumber()
  totalCursosActivos: number;

  @ApiProperty({ description: 'Tasa de completación en porcentaje' })
  @IsNumber()
  @Min(0)
  @Max(100)
  tasaCompletacion: number;

  @ApiProperty({ description: 'Total de tareas pendientes' })
  @IsOptional()
  @IsNumber()
  tareasPendientes?: number;

  @ApiProperty({ description: 'Total de mensajes sin leer' })
  @IsOptional()
  @IsNumber()
  mensajesSinLeer?: number;

  @ApiProperty({ description: 'Actividad reciente en los últimos 7 días' })
  @IsOptional()
  @IsNumber()
  actividadReciente?: number;
}

export class DocenteCursoDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsString()
  descripcion: string;

  @ApiProperty()
  @IsNumber()
  estudiantes: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  progreso: number;

  @ApiProperty()
  @IsEnum(EstadoCurso)
  estado: EstadoCurso;

  @ApiProperty()
  @IsDateString()
  fechaInicio: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}

export class DocenteEstudianteDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsString()
  apellido: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ isArray: true })
  @IsOptional()
  @IsArray()
  cursos?: string[];

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  progreso: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  calificacionPromedio?: number;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  ultimoAcceso?: string;
}

export class DocenteTareaDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  titulo: string;

  @ApiProperty()
  @IsString()
  descripcion: string;

  @ApiProperty()
  @IsDateString()
  fechaVencimiento: string;

  @ApiProperty()
  @IsNumber()
  estudiantes: number;

  @ApiProperty()
  @IsEnum(EstadoTarea)
  estado: EstadoTarea;

  @ApiProperty()
  @IsEnum(TipoPrioridad)
  prioridad: TipoPrioridad;

  @ApiProperty()
  @IsNumber()
  completadas: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  tasaCompletacion: number;
}

export class DocenteMensajeDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  remitente: string;

  @ApiProperty()
  @IsString()
  asunto: string;

  @ApiProperty()
  @IsDateString()
  fecha: string;

  @ApiProperty()
  @IsBoolean()
  leido: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  preview?: string;
}

// ============================================================================
// TAREAS - CREATE/UPDATE DTOs
// ============================================================================

export class CreateTareaDto {
  @ApiProperty({ description: 'Título de la tarea' })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  titulo: string;

  @ApiProperty({ description: 'Descripción detallada' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  descripcion: string;

  @ApiProperty({ description: 'Fecha de vencimiento en formato ISO' })
  @IsNotEmpty()
  @IsDateString()
  fechaVencimiento: string;

  @ApiProperty({ description: 'IDs de cursos a los que asignar', isArray: true })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  cursoIds: number[];

  @ApiProperty({ enum: TipoPrioridad, description: 'Nivel de prioridad' })
  @IsOptional()
  @IsEnum(TipoPrioridad)
  prioridad?: TipoPrioridad = TipoPrioridad.MEDIA;

  @ApiProperty({ description: 'Descripción adicional o instrucciones' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  instrucciones?: string;

  @ApiProperty({ description: 'Rubrica o criterios de evaluación' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rubrica?: string;
}

export class UpdateTareaDto {
  @ApiProperty({ description: 'Título de la tarea' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  titulo?: string;

  @ApiProperty({ description: 'Descripción detallada' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  descripcion?: string;

  @ApiProperty({ description: 'Fecha de vencimiento en formato ISO' })
  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @ApiProperty({ enum: EstadoTarea, description: 'Estado de la tarea' })
  @IsOptional()
  @IsEnum(EstadoTarea)
  estado?: EstadoTarea;

  @ApiProperty({ enum: TipoPrioridad, description: 'Nivel de prioridad' })
  @IsOptional()
  @IsEnum(TipoPrioridad)
  prioridad?: TipoPrioridad;

  @ApiProperty({ description: 'Instrucciones adicionales' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  instrucciones?: string;

  @ApiProperty({ description: 'Rubrica actualizada' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rubrica?: string;
}

// ============================================================================
// MENSAJES DTOs
// ============================================================================

export class SendMensajeDto {
  @ApiProperty({ description: 'ID del estudiante destinatario' })
  @IsNotEmpty()
  @IsNumber()
  estudianteId: number;

  @ApiProperty({ description: 'Asunto del mensaje' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  asunto: string;

  @ApiProperty({ description: 'Contenido del mensaje' })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(5000)
  mensaje: string;

  @ApiProperty({ description: 'Indicador si es urgente', required: false })
  @IsOptional()
  @IsBoolean()
  urgente?: boolean;
}

export class SendMensajeGrupalDto {
  @ApiProperty({
    description: 'IDs de estudiantes destinatarios',
    isArray: true,
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  estudianteIds: number[];

  @ApiProperty({ description: 'Asunto del mensaje' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  asunto: string;

  @ApiProperty({ description: 'Contenido del mensaje' })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(5000)
  mensaje: string;

  @ApiProperty({ description: 'Indicador si es urgente', required: false })
  @IsOptional()
  @IsBoolean()
  urgente?: boolean;
}

// ============================================================================
// CALIFICACIONES DTOs
// ============================================================================

export class CreateCalificacionDto {
  @ApiProperty({ description: 'ID del estudiante' })
  @IsNotEmpty()
  @IsNumber()
  estudianteId: number;

  @ApiProperty({ description: 'ID de la tarea/actividad' })
  @IsNotEmpty()
  @IsNumber()
  tareaId: number;

  @ApiProperty({ description: 'Calificación numérica (0-100)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  calificacion: number;

  @ApiProperty({ description: 'Comentarios y retroalimentación' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comentarios?: string;

  @ApiProperty({ description: 'Rubrica de evaluación' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rubricaDetallada?: string;
}

export class CalificacionesEstudianteDto {
  @ApiProperty()
  @IsNumber()
  estudianteId: number;

  @ApiProperty()
  @IsString()
  nombreEstudiante: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  calificacionPromedio: number;

  @ApiProperty({ isArray: true })
  @IsArray()
  calificacionesPorTarea: CalificacionTareaDto[];
}

export class CalificacionTareaDto {
  @ApiProperty()
  @IsNumber()
  tareaId: number;

  @ApiProperty()
  @IsString()
  nombreTarea: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  calificacion: number;

  @ApiProperty()
  @IsDateString()
  fecha: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  comentarios?: string;
}

// ============================================================================
// REPORTES DTOs
// ============================================================================

export class ReporteProgresoEstudianteDto {
  @ApiProperty()
  @IsNumber()
  estudianteId: number;

  @ApiProperty()
  @IsString()
  nombreEstudiante: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  tasaCompletacion: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  calificacionPromedio: number;

  @ApiProperty({ description: 'Tareas completadas/totales' })
  @IsString()
  tareasCompletadas: string;

  @ApiProperty()
  @IsDateString()
  ultimoAcceso: string;

  @ApiProperty({ isArray: true })
  @IsArray()
  cursosEnrolados: string[];
}

export class ReporteCursoDto {
  @ApiProperty()
  @IsNumber()
  cursoId: number;

  @ApiProperty()
  @IsString()
  nombreCurso: string;

  @ApiProperty()
  @IsNumber()
  totalEstudiantes: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  calificacionPromedioCurso: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  tasaCompletacionCurso: number;

  @ApiProperty()
  @IsDateString()
  fechaInicio: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiProperty({ isArray: true })
  @IsArray()
  estudiantes: ReporteEstudianteCursoDto[];
}

export class ReporteEstudianteCursoDto {
  @ApiProperty()
  @IsNumber()
  estudianteId: number;

  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  calificacion: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  progreso: number;
}

export class GenerarReporteDto {
  @ApiProperty({ description: 'Tipo de reporte', required: false })
  @IsOptional()
  @IsEnum(['curso', 'estudiante', 'general'])
  tipo?: 'curso' | 'estudiante' | 'general';

  @ApiProperty({ description: 'ID de la entidad (curso o estudiante)', required: false })
  @IsOptional()
  @IsNumber()
  entidadId?: number;

  @ApiProperty({ description: 'Fecha inicial', required: false })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiProperty({ description: 'Fecha final', required: false })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiProperty({ description: 'Incluir datos detallados', required: false })
  @IsOptional()
  @IsBoolean()
  detalladoId?: boolean;
}

// ============================================================================
// CONTENIDO DE CURSO DTOs
// ============================================================================

export class CreateContenidoDto {
  @ApiProperty({ description: 'Título del contenido' })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  titulo: string;

  @ApiProperty({ description: 'Descripción del contenido' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  descripcion: string;

  @ApiProperty({ description: 'ID del curso' })
  @IsNotEmpty()
  @IsNumber()
  cursoId: number;

  @ApiProperty({ description: 'URL del recurso (si aplica)' })
  @IsOptional()
  @IsString()
  @Matches(/^(https?:\/\/)?/, { message: 'URL inválida' })
  urlRecurso?: string;

  @ApiProperty({ description: 'Orden de aparición' })
  @IsOptional()
  @IsNumber()
  orden?: number;
}

export class UpdateContenidoDto {
  @ApiProperty({ description: 'Título del contenido' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  titulo?: string;

  @ApiProperty({ description: 'Descripción del contenido' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  descripcion?: string;

  @ApiProperty({ description: 'URL del recurso' })
  @IsOptional()
  @IsString()
  urlRecurso?: string;

  @ApiProperty({ description: 'Orden de aparición' })
  @IsOptional()
  @IsNumber()
  orden?: number;
}

// ============================================================================
// RESPUESTAS EXITOSAS DTOs
// ============================================================================

export class RespuestaExitosaDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  mensaje: string;

  @ApiProperty()
  data?: T;

  @ApiProperty()
  timestamp: string;
}

export class PaginacionDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  pagina: number;

  @ApiProperty()
  limite: number;

  @ApiProperty()
  totalPaginas: number;

  @ApiProperty({ isArray: true })
  datos: any[];
}

