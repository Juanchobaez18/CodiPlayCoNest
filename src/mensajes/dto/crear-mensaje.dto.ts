import { IsString, IsNumber, IsEnum, Min, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RemitenteTipo {
  ESTUDIANTE = 'estudiante',
  DOCENTE = 'docente',
}

export enum MensajeEstado {
  ENVIADO = 'enviado',
  ENTREGADO = 'entregado',
  LEIDO = 'leido',
}

export class CrearMensajeDto {
  @ApiProperty({ example: 'Hola, ¿cómo estás?', description: 'Contenido del mensaje (1-1000 caracteres)' })
  @IsString()
  @MinLength(1, { message: 'El contenido debe tener al menos 1 carácter' })
  @MaxLength(1000, { message: 'El contenido no puede exceder 1000 caracteres' })
  contenido: string;

  @ApiProperty({ example: 1, description: 'ID del estudiante (debe ser positivo)' })
  @IsNumber()
  @Min(1, { message: 'El ID del estudiante debe ser un número positivo' })
  estudianteId: number;

  @ApiProperty({ example: 1, description: 'ID del docente (debe ser positivo)' })
  @IsNumber()
  @Min(1, { message: 'El ID del docente debe ser un número positivo' })
  docenteId: number;

  @ApiProperty({ enum: RemitenteTipo, example: RemitenteTipo.ESTUDIANTE })
  @IsEnum(RemitenteTipo, { message: 'El tipo de remitente debe ser estudiante o docente' })
  remitenteTipo: RemitenteTipo;
}