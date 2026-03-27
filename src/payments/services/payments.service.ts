import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { CreatePaymentDto } from '../dtos/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * CREATE: Crea una nueva transacción de pago
   */
  async create(
    estudianteId: number,
    createPaymentDto: CreatePaymentDto,
  ): Promise<Transaction> {
    if (!createPaymentDto.courseId || !createPaymentDto.amount) {
      throw new BadRequestException(
        'courseId and amount are required',
      );
    }

    const transaction = this.transactionRepository.create({
      estudianteId,
      cursoId: createPaymentDto.courseId,
      amount: createPaymentDto.amount,
      currency: 'USD',
      status: TransactionStatus.PENDING,
    });

    return await this.transactionRepository.save(transaction);
  }

  /**
   * READ: Obtiene todas las transacciones del estudiante autenticado
   */
  async getByStudent(
    estudianteId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.transactionRepository.findAndCount({
      where: { estudianteId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  /**
   * READ: Obtiene una transacción por ID
   */
  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  /**
   * UPDATE: Actualiza una transacción
   */
  async update(
    id: number,
    updateData: Partial<Transaction>,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id);

    if (updateData.status) {
      transaction.status = updateData.status;
    }
    if (updateData.amount) {
      transaction.amount = updateData.amount;
    }
    if (updateData.metadata) {
      transaction.metadata = updateData.metadata;
    }

    return await this.transactionRepository.save(transaction);
  }

  /**
   * DELETE: Elimina una transacción
   */
  async remove(id: number): Promise<{ message: string }> {
    const transaction = await this.findOne(id);
    await this.transactionRepository.remove(transaction);
    return { message: `Transaction ${id} deleted successfully` };
  }

  /**
   * READ (Admin): Obtiene TODAS las transacciones con filtros
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: TransactionStatus;
      estudianteId?: number;
      cursoId?: number;
    },
  ): Promise<{
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.estudianteId) where.estudianteId = filters.estudianteId;
    if (filters?.cursoId) where.cursoId = filters.cursoId;

    const [data, total] = await this.transactionRepository.findAndCount({
      where: Object.keys(where).length > 0 ? where : undefined,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }
}
