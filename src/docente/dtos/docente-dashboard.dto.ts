import { IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class DocenteDashboardStatsDto {
  @IsNumber()
  totalEstudiantes: number;

  @IsNumber()
  totalCursosActivos: number;

  @IsNumber()
  tasaCompletacion: number;
}

export class DocenteCursoDto {
  @IsNumber()
  id: number;

  @IsString()
  nombre: string;

  @IsString()
  descripcion: string;

  @IsNumber()
  estudiantes: number;

  @IsNumber()
  progreso: number;

  @IsBoolean()
  estado: boolean;
}

export class DocenteEstudianteDto {
  @IsNumber()
  id: number;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  email: string;

  @IsOptional()
  cursos?: string[];

  @IsNumber()
  progreso: number;
}

export class DocenteTareaDto {
  @IsNumber()
  id: number;

  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsString()
  fechaVencimiento: string;

  @IsNumber()
  estudiantes: number;

  @IsString()
  estado: string; // 'pendiente' | 'completada' | 'vencida'
}

export class DocenteMensajeDto {
  @IsNumber()
  id: number;

  @IsString()
  remitente: string;

  @IsString()
  asunto: string;

  @IsString()
  fecha: string;

  @IsBoolean()
  leido: boolean;
}

export class CreateTareaDto {
  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsString()
  fechaVencimiento: string;

  @IsOptional()
  @IsNumber({}, { each: true })
  estudiantesIds?: number[];
}

export class SendMensajeDto {
  @IsString()
  destinatario: string;

  @IsString()
  asunto: string;

  @IsString()
  mensaje: string;
}
