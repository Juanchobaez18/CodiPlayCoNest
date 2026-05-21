import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString, IsOptional, IsNotEmpty, MinLength } from "class-validator";
import { string } from "joi";

export class CreateLeccionesDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @ApiProperty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @ApiProperty()
  contenido: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  orden: string;

  @IsEnum(['borrador', 'publicado'])
  @IsNotEmpty()
  @ApiProperty({ enum: ['borrador', 'publicado'], default: 'borrador' })
  estado: string;

  // 🔥 clave para relacionar con modulo
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  moduloId: number;
}

export class UpdateLeccionesDto extends PartialType(CreateLeccionesDto) { }