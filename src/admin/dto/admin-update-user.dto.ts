import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional()
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  docType?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  docNumber?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  @ApiPropertyOptional({ type: [Number] })
  roleIds?: number[];

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  @ApiPropertyOptional()
  password?: string;
}
