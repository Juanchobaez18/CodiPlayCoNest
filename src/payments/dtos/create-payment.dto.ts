import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
