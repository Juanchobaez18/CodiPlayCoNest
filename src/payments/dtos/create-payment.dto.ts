import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  courseName?: string;
}
