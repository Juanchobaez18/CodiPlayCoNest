/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, ArrayNotEmpty } from "class-validator";
import { PartialType, ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateForumDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly titulo: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly descripcion: string;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @ApiProperty()
    readonly docente_id: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @ApiProperty()
    readonly modulo_id: number;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    @Type(() => Number)
    @ApiProperty({ type: [Number] })
    readonly estudianteIds: number[];
}

export class UpdateForumDto extends PartialType(CreateForumDto) {}
