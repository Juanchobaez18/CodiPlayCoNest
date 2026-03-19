import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from 'src/users/dtos/user.dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateDocenteDto {

  // 🔹 datos de docente
@IsString()
@IsNotEmpty()
@ApiProperty()
ultimoAcceso: string;

@IsNumber()
@ApiProperty()
pagos: number;

  // 🔥 datos de usuario embebidos
user: CreateUserDto;
}
export class UpdateDocenteDto extends PartialType(CreateDocenteDto) {}