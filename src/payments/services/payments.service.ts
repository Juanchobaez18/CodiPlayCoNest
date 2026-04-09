import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { UpdatePaymentDto } from '../dtos/update-payment.dto';
import { Estudiante } from '../../estudiantes/entities/estudiantes.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
  ) {}

  /**
   * Busca el Estudiante asociado a un User.
   * El JWT guarda el User.id, pero la tabla transactions usa Estudiante.id.
   */
  private async findEstudianteByUserId(userId: number): Promise<Estudiante> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!estudiante) {
      throw new BadRequestException(
        `El usuario #${userId} no tiene un perfil de estudiante asignado`,
      );
    }
    return estudiante;
  }

  /**
   * CREATE: Crea una nueva transacción de pago
   */
  async create(
    userId: number,
    createPaymentDto: CreatePaymentDto,
  ): Promise<Transaction> {
    const estudiante = await this.findEstudianteByUserId(userId);

    const transaction = this.transactionRepository.create({
      estudianteId: estudiante.id,
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
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    const estudiante = await this.findEstudianteByUserId(userId);
    const skip = (page - 1) * limit;

    const [data, total] = await this.transactionRepository.findAndCount({
      where: { estudianteId: estudiante.id },
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
   * UPDATE: Actualiza solo los campos permitidos de una transacción
   */
  async update(id: number, updateData: UpdatePaymentDto): Promise<Transaction> {
    const transaction = await this.findOne(id);

    if (updateData.status !== undefined) {
      transaction.status = updateData.status;
    }
    if (updateData.amount !== undefined) {
      transaction.amount = updateData.amount;
    }
    if (updateData.metadata !== undefined) {
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
