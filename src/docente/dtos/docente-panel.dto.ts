import {
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
  Min,
  Max,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTOs para operaciones del panel docente
 * Incluye filtros, búsquedas y operaciones comunes
 */

// ============================================================================
// FILTROS Y BÚSQUEDAS
// ============================================================================

export class FiltroTareasDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['pendiente', 'en_progreso', 'completada', 'vencida', 'cancelada'])
  estado?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['baja', 'media', 'alta', 'urgente'])
  prioridad?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  cursoId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pagina?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limite?: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  busqueda?: string;
}

export class FiltroEstudiantesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  cursoId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  busqueda?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['nombre', 'apellido', 'email', 'progreso'])
  ordenarPor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  orden?: 'asc' | 'desc' = 'asc';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pagina?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limite?: number = 20;
}

export class FiltroMensajesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  leidos?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  urgentes?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remitente?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pagina?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limite?: number = 15;
}

// ============================================================================
// ACTUALIZACIÓN DE ESTADO
// ============================================================================

export class CambiarEstadoTareaDto {
  @ApiProperty({ enum: ['pendiente', 'en_progreso', 'completada', 'vencida', 'cancelada'] })
  @IsNotEmpty()
  @IsEnum(['pendiente', 'en_progreso', 'completada', 'vencida', 'cancelada'])
  nuevoEstado: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}

export class MarcarMensajeLeido {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  leido: boolean;
}

export class MarcarMultiplesMensajesLeido {
  @ApiProperty({ isArray: true })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  mensajeIds: number[];

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  leido: boolean;
}

// ============================================================================
// ESTADÍSTICAS Y REPORTES
// ============================================================================

export class EstadisticasEstudianteDto {
  @ApiProperty()
  @IsNumber()
  estudianteId: number;

  @ApiProperty()
  @IsString()
  nombreCompleto: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  progresoGeneral: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  calificacionPromedio: number;

  @ApiProperty()
  @IsNumber()
  tareasCompletadas: number;

  @ApiProperty()
  @IsNumber()
  tareasPendientes: number;

  @ApiProperty()
  @IsNumber()
  tareasAtrasadas: number;

  @ApiProperty()
  @IsDateString()
  ultimoAcceso: string;

  @ApiProperty()
  @IsNumber()
  diasInactivo: number;
}

export class EstadisticasCursoDto {
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
  estudiantesActivos: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  calificacionPromedioCurso: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  tasaCompletacionPromedio: number;

  @ApiProperty()
  @IsNumber()
  tareasAsignadas: number;

  @ApiProperty()
  @IsNumber()
  tareasCompletadas: number;

  @ApiProperty()
  @IsDateString()
  fechaInicio: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}

export class EstadisticasGeneralesDocenteDto {
  @ApiProperty()
  @IsNumber()
  totalEstudiantes: number;

  @ApiProperty()
  @IsNumber()
  totalCursos: number;

  @ApiProperty()
  @IsNumber()
  cursosActivos: number;

  @ApiProperty()
  @IsNumber()
  totalTareasAsignadas: number;

  @ApiProperty()
  @IsNumber()
  tareasCompletadas: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  calificacionPromedioGeneral: number;

  @ApiProperty()
  @IsNumber()
  mensajesPendientes: number;

  @ApiProperty()
  @IsDateString()
  ultimoAcceso: string;
}

// ============================================================================
// ASIGNACIÓN MASIVA
// ============================================================================

export class AsignarTareaMultipleDto {
  @ApiProperty({ description: 'ID de la tarea' })
  @IsNotEmpty()
  @IsNumber()
  tareaId: number;

  @ApiProperty({ description: 'IDs de estudiantes', isArray: true })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  estudianteIds: number[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;
}

export class CambiarEstadoMultipleTareaDto {
  @ApiProperty({ description: 'IDs de tareas', isArray: true })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  tareaIds: number[];

  @ApiProperty({ enum: ['pendiente', 'en_progreso', 'completada', 'vencida', 'cancelada'] })
  @IsNotEmpty()
  @IsEnum(['pendiente', 'en_progreso', 'completada', 'vencida', 'cancelada'])
  nuevoEstado: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}

// ============================================================================
// ACTIVIDAD Y NOTIFICACIONES
// ============================================================================

export class RegistroActividadDto {
  @ApiProperty()
  @IsNumber()
  docenteId: number;

  @ApiProperty()
  @IsString()
  accion: string;

  @ApiProperty()
  @IsString()
  detalles: string;

  @ApiProperty()
  @IsDateString()
  fecha: string;

  @ApiProperty()
  @IsString()
  ip?: string;

  @ApiProperty()
  @IsString()
  userAgent?: string;
}

export class ConfiguracionNotificacionesDto {
  @ApiProperty()
  @IsBoolean()
  notificarTareasVencidas: boolean = true;

  @ApiProperty()
  @IsBoolean()
  notificarNuevosMensajes: boolean = true;

  @ApiProperty()
  @IsBoolean()
  notificarTareasCompletas: boolean = true;

  @ApiProperty()
  @IsBoolean()
  notificarActividadEstudiantes: boolean = true;

  @ApiProperty()
  @IsBoolean()
  notificarBajaActividad: boolean = true;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  diasNotificacionBajaActividad?: number = 7;
}

// ============================================================================
// VISTA RÁPIDA Y ATAJOS
// ============================================================================

export class VistaRapidaDto {
  @ApiProperty()
  @IsNumber()
  tareasPendientes: number;

  @ApiProperty()
  @IsNumber()
  mensajesSinLeer: number;

  @ApiProperty()
  @IsNumber()
  estudiantesConBajoProgreso: number;

  @ApiProperty()
  @IsNumber()
  tareasVencidasProximas: number;

  @ApiProperty()
  @IsNumber()
  actividades24h: number;

  @ApiProperty()
  @IsArray()
  alumnosAlerta: string[];
}

// ============================================================================
// RESPUESTA PAGINADA
// ============================================================================

export class RespuestaPaginada<T> {
  @ApiProperty()
  @IsNumber()
  total: number;

  @ApiProperty()
  @IsNumber()
  pagina: number;

  @ApiProperty()
  @IsNumber()
  limite: number;

  @ApiProperty()
  @IsNumber()
  totalPaginas: number;

  @ApiProperty({ isArray: true })
  @IsArray()
  datos: T[];
}
