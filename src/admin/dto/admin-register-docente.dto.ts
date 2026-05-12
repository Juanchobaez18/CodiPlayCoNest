import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

/** Cuerpo plano equivalente al formulario Spring de registro de docente. */
export class AdminRegisterDocenteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  docType: string;

  @IsString()
  @IsNotEmpty()
  docNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;
}
