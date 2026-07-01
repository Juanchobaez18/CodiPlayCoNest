import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResultadoCalificacion } from '../entities/tarea-entrega.entity';

export class SendMensajePanelDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  destinatarioId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  contenido: string;
}

export class CalificarTareaDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  entregaId: number;

  @ApiProperty({ enum: ['Aprobado', 'No aprobado'] })
  @IsString()
  @IsNotEmpty()
  calificacion: string;

  @ApiProperty({ enum: ResultadoCalificacion })
  @IsEnum(ResultadoCalificacion)
  resultado: ResultadoCalificacion;
}

export class CreateForoPanelDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  titulo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  descripcion: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  cursoId: number;
}

export class UpdateForoPanelDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  titulo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  descripcion?: string;
}

export class FiltroCursosQueryDto {
  @IsOptional()
  estado?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class FiltroEstudiantesQueryDto {
  @IsOptional()
  @IsNumber()
  cursoId?: number;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class FiltroMensajesQueryDto {
  @IsOptional()
  @IsEnum(['enviado', 'recibido', 'todos'])
  tipo?: 'enviado' | 'recibido' | 'todos';

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class UpdateFechaVencimientoDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  tareaId: number;

  @ApiProperty({ description: 'ISO 8601 date string' })
  @IsDateString()
  @IsNotEmpty()
  fechaVencimiento: string;
}
