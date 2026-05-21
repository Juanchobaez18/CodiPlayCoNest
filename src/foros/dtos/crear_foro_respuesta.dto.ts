import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CrearForoRespuestaDto {

  @IsString()
  @IsNotEmpty()
  contenido: string;

  @IsNumber()
  @IsNotEmpty()
  foroId: number;

  @IsNumber()
  @IsOptional()
  estudianteId?: number;

  @IsNumber()
  @IsOptional()
  docenteId?: number;
}