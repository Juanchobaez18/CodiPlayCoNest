import { IsString, IsNotEmpty, IsEmail, MinLength, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterEstudianteDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Juan' })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Pérez' })
  readonly lastName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'CC' })
  readonly docType: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1234567890' })
  readonly docNumber: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'juan@example.com' })
  readonly email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'segura123' })
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '2005-06-15' })
  readonly fechanacimiento: string;

  @IsInt()
  @Min(1)
  @Max(120)
  @Type(() => Number)
  @ApiProperty({ example: 18 })
  readonly edad: number;
}
