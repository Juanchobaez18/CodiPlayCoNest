import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNumber, IsString, isString } from "class-validator";
import { string } from "joi";

export class CreateLeccionesDto {
@IsString()
@ApiProperty()
titulo: string;

@IsString()
@ApiProperty()
descripcion: string;

@IsString()
@ApiProperty()
contenido: string;

@IsString()
@ApiProperty()
orden: string;

  // 🔥 clave para relacionar con modulo
@IsNumber()
moduloId: number;
}
export class UpdateLeccionesDto extends PartialType(CreateLeccionesDto) {}