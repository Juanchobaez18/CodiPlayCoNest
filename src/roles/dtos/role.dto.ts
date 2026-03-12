/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsInt, IsNumber } from "class-validator";
import { PartialType, ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly description: string;

    @ApiProperty({
        example: [1, 2, 3],
        description: 'IDs de los módulos asignados al rol'
    })
    @IsArray()
    @IsNumber({}, { each: true })
    moduleIds: number[];
}
export class UpdateRoleDto extends PartialType(CreateRoleDto) { }