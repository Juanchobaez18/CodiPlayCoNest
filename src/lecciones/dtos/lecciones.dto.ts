import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

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

@IsNumber()
@ApiProperty()
orden: number;

  // 🔥 clave para relacionar con modulo
@IsNumber()
moduloId: number;
}
export class UpdateLeccionesDto extends PartialType(CreateLeccionesDto) {}