import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo de la persona interesada' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(120, { message: 'El nombre no puede superar los 120 caracteres' })
  name: string;

  @ApiProperty({ example: 'juan@example.com', description: 'Correo electrónico del interesado' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty({ example: '+57 300 0000000', description: 'Teléfono de contacto (opcional)' })
  @IsOptional()
  @MaxLength(30, { message: 'El teléfono no puede superar los 30 caracteres' })
  phone?: string;

  @ApiProperty({ example: 'Quisiera información sobre la clase gratis y las fechas disponibles.', description: 'Mensaje o interés principal' })
  @IsOptional()
  @MaxLength(1000, { message: 'El mensaje no puede superar los 1000 caracteres' })
  message?: string;
}
