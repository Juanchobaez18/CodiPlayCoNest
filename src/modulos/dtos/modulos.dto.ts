import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { boolean, number, string } from "joi";

export class CreateModulosDto {
  @IsString()
  @ApiProperty()
  titulo: string;

  @IsString()
  @ApiProperty()
  descripcion: string;

  @IsNumber()
  @ApiProperty()
  orden: number;

  @IsBoolean()
@ApiProperty()
  completado: boolean;

  @IsOptional()
  @IsString()
@ApiProperty({ required: false })
  fechaCompletado?: string;

  // 🔥 clave para relacionar con curso
  @IsNumber()
  cursoId: number;
}
export class UpdateModulosDto extends PartialType(CreateModulosDto) {}