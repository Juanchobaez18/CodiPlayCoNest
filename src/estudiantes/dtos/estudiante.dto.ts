import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { PartialType, ApiProperty } from '@nestjs/swagger';

export class CreateEstudianteDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: '2005-06-15', description: 'Fecha de nacimiento del estudiante' })
    readonly fechanacimiento: string;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ example: 18, description: 'Edad del estudiante' })
    readonly edad: number;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ example: 1, description: 'ID del usuario asociado al estudiante' })
    readonly userId: number;
}

export class UpdateEstudianteDto extends PartialType(CreateEstudianteDto) {}
