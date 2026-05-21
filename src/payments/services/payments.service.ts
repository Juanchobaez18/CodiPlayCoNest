import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { UpdatePaymentDto } from '../dtos/update-payment.dto';
import { Estudiante } from '../../estudiantes/entities/estudiantes.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
    private configService: ConfigService,
  ) {
    const stripeSecret = this.configService.get<string>('config.stripe.secretKey');
    if (!stripeSecret) {
      throw new Error('Stripe secret key is not configured in environment variables');
    }

    this.stripe = new Stripe(stripeSecret, {
      apiVersion: '2026-03-25.dahlia',
    });
  }

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

  async createStripePaymentIntent(
    userId: number,
    createPaymentDto: CreatePaymentDto,
  ): Promise<{ transaction: Transaction; clientSecret: string }> {
    const estudiante = await this.findEstudianteByUserId(userId);

    const transaction = this.transactionRepository.create({
      estudianteId: estudiante.id,
      cursoId: createPaymentDto.courseId,
      amount: createPaymentDto.amount,
      currency: this.configService.get<string>('stripe.currency') || 'usd',
      status: TransactionStatus.PENDING,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(createPaymentDto.amount * 100),
      currency: (
        this.configService.get<string>('config.stripe.currency') || 'usd'
      ).toLowerCase(),
      metadata: {
        transactionId: savedTransaction.id.toString(),
        estudianteId: estudiante.id.toString(),
        cursoId: createPaymentDto.courseId.toString(),
      },
      description: `Pago curso ${createPaymentDto.courseId} por estudiante ${estudiante.id}`,
    });

    savedTransaction.stripePaymentIntentId = paymentIntent.id;
    await this.transactionRepository.save(savedTransaction);

    return {
      transaction: savedTransaction,
      clientSecret: paymentIntent.client_secret ?? '',
    };
  }

  async handleStripeWebhook(
    signature: string,
    payload: Buffer,
  ): Promise<Transaction | null> {
    const webhookSecret =
      this.configService.get<string>('config.stripe.webhookSecret') ?? '';

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(
        `Stripe webhook verification failed: ${err instanceof Error ? err.message : err}`,
      );
    }

    if (
      event.type !== 'payment_intent.succeeded' &&
      event.type !== 'payment_intent.payment_failed'
    ) {
      return null;
    }

    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const transaction = await this.transactionRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!transaction) {
      return null;
    }

    if (event.type === 'payment_intent.succeeded') {
      transaction.status = TransactionStatus.COMPLETED;
    } else if (event.type === 'payment_intent.payment_failed') {
      transaction.status = TransactionStatus.FAILED;
    }

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
