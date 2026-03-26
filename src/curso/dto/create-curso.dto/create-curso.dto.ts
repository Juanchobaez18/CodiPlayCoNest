import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, IsNotEmpty } from 'class-validator';

import { ApiProperty, PartialType } from '@nestjs/swagger';
export class CreateCursoDto {

@ApiProperty()
@IsString()
  nombre: string;

  @ApiProperty()
  @IsString()
  descripcion: string;

@ApiProperty()
  @IsString()
  dificultad: string;

@ApiProperty()
  @IsNumber()
  precio: number;

@ApiProperty()
  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  // Relación con docente (1)
  @IsNumber()
  docenteId: number;

  // Relación con estudiantes (muchos)
  @IsArray()
  estudiantesIds: number[];
}

export class UpdateCursoDto extends PartialType(CreateCursoDto) {}