/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsNumber, IsPositive, IsBoolean, IsOptional } from "class-validator";
import { PartialType, ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly password: string;

    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty()
    readonly isActive: boolean;
}