import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './services/payments.service';
import { Transaction } from './entities/transaction.entity';
import { Estudiante } from '../estudiantes/entities/estudiantes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Estudiante])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
