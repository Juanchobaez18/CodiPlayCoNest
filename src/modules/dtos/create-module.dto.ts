import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateModuleDto {

  @ApiProperty({
    example: 'users',
    description: 'Nombre del módulo del sistema'
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'User management module',
    description: 'Descripción del módulo'
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateModuleDto  extends PartialType(CreateModuleDto) { }