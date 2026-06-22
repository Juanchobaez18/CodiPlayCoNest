import { IsNumber, IsString, IsEnum, IsDate, IsOptional } from 'class-validator';
import { TransactionStatus } from '../entities/transaction.entity';
import { Expose } from 'class-transformer';

export class TransactionDto {
  @Expose()
  @IsNumber()
  id: number;

  @Expose()
  @IsNumber()
  estudianteId: number;

  @Expose()
  @IsNumber()
  cursoId: number;

  @Expose()
  @IsNumber()
  amount: number;

  @Expose()
  @IsString()
  currency: string;

  @Expose()
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;
}
