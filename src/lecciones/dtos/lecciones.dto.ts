import { ApiProperty, PartialType } from "@nestjs/swagger";
import { isString } from "class-validator";
import { string } from "joi";

export class CreateLeccionesDto {
@isString()
@ApiProperty()
titulo: string;

@isString()
@ApiProperty()
descripcion: string;

@isString()
@ApiProperty()
contenido: string;

@isString()
@ApiProperty()
orden: string;
}

export class UpdateLeccionesDto extends PartialType(CreateLeccionesDto) { }