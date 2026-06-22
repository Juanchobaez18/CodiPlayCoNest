import { IsEnum, IsNumber, IsOptional, IsObject, Min } from 'class-validator';
import { TransactionStatus } from '../entities/transaction.entity';

export class UpdatePaymentDto {
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
