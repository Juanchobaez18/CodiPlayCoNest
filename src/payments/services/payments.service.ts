import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { UpdatePaymentDto } from '../dtos/update-payment.dto';
import { Estudiante } from '../../estudiantes/entities/estudiantes.entity';
import { Curso } from '../../curso/entity/curso.entity/curso.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Curso)
    private cursoRepository: Repository<Curso>,
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

    const currency = (
      this.configService.get<string>('config.stripe.currency') || 'usd'
    ).toLowerCase();

    const transaction = this.transactionRepository.create({
      estudianteId: estudiante.id,
      cursoId: createPaymentDto.courseId,
      amount: createPaymentDto.amount,
      currency,
      status: TransactionStatus.PENDING,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(createPaymentDto.amount * 100),
      currency,

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

  async createStripeCheckoutSession(
    userId: number,
    createPaymentDto: CreatePaymentDto,
  ): Promise<{ url: string; transactionId: number }> {
    const estudiante = await this.findEstudianteByUserId(userId);
    const frontendUrl =
      this.configService.get<string>('config.frontendUrl') ||
      'http://localhost:4200';
    const currency = (
      this.configService.get<string>('config.stripe.currency') || 'usd'
    ).toLowerCase();

    const transaction = this.transactionRepository.create({
      estudianteId: estudiante.id,
      cursoId: createPaymentDto.courseId,
      amount: createPaymentDto.amount,
      currency,
      status: TransactionStatus.PENDING,
    });
    const savedTransaction = await this.transactionRepository.save(transaction);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name:
                createPaymentDto.courseName ||
                `Curso #${createPaymentDto.courseId}`,
              description: 'CodiPlayCo — Acceso completo al curso',
            },
            unit_amount: Math.round(createPaymentDto.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}&transaccion=${savedTransaction.id}`,
      cancel_url: `${frontendUrl}/registro-pago/${createPaymentDto.courseId}?cancelado=true`,
      metadata: {
        transactionId: savedTransaction.id.toString(),
        estudianteId: estudiante.id.toString(),
        cursoId: createPaymentDto.courseId.toString(),
      },
    });

    savedTransaction.stripePaymentIntentId = session.id;
    await this.transactionRepository.save(savedTransaction);

    return { url: session.url!, transactionId: savedTransaction.id };
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

    const handled = [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'checkout.session.completed',
      'checkout.session.expired',
    ];
    if (!handled.includes(event.type)) return null;

    let stripeId: string;
    let completed: boolean;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      stripeId = session.id;
      completed = session.payment_status === 'paid';
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      stripeId = session.id;
      completed = false;
    } else {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      stripeId = paymentIntent.id;
      completed = event.type === 'payment_intent.succeeded';
    }

    const transaction = await this.transactionRepository.findOne({
      where: { stripePaymentIntentId: stripeId },
    });
    if (!transaction) return null;

    transaction.status = completed
      ? TransactionStatus.COMPLETED
      : TransactionStatus.FAILED;

    const saved = await this.transactionRepository.save(transaction);

    if (completed && transaction.cursoId && transaction.estudianteId) {
      const estudiante = await this.estudianteRepository.findOne({
        where: { id: transaction.estudianteId },
        relations: ['cursos'],
      });
      const curso = await this.cursoRepository.findOne({
        where: { id: transaction.cursoId },
      });
      if (estudiante && curso) {
        const alreadyEnrolled = estudiante.cursos.some((c) => c.id === curso.id);
        if (!alreadyEnrolled) {
          estudiante.cursos.push(curso);
          await this.estudianteRepository.save(estudiante);
        }
      }
    }

    return saved;
  }

  async confirmEnrollment(
    userId: number,
    transaccionId: number,
  ): Promise<{ inscrito: boolean; cursoId: number }> {
    const estudiante = await this.findEstudianteByUserId(userId);

    const transaction = await this.transactionRepository.findOne({
      where: { id: transaccionId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transacción #${transaccionId} no encontrada`);
    }
    if (transaction.estudianteId !== estudiante.id) {
      throw new ForbiddenException('Esta transacción no pertenece al usuario autenticado');
    }

    if (transaction.status === TransactionStatus.COMPLETED) {
      await this.ensureEnrollment(estudiante.id, transaction.cursoId);
      return { inscrito: true, cursoId: transaction.cursoId };
    }

    if (
      transaction.status === TransactionStatus.PENDING &&
      transaction.stripePaymentIntentId
    ) {
      try {
        const stripeId = transaction.stripePaymentIntentId;
        let sessionPaid = false;

        if (stripeId.startsWith('cs_')) {
          const session = await this.stripe.checkout.sessions.retrieve(stripeId);
          sessionPaid = session.payment_status === 'paid';
        } else if (stripeId.startsWith('pi_')) {
          const paymentIntent = await this.stripe.paymentIntents.retrieve(stripeId);
          sessionPaid = paymentIntent.status === 'succeeded';
        }

        if (sessionPaid) {
          transaction.status = TransactionStatus.COMPLETED;
          await this.transactionRepository.save(transaction);
          await this.ensureEnrollment(estudiante.id, transaction.cursoId);
          return { inscrito: true, cursoId: transaction.cursoId };
        }
      } catch (_) {
        // Stripe API unavailable or ID invalid — fall through
      }
    }

    return { inscrito: false, cursoId: transaction.cursoId ?? 0 };
  }

  private async ensureEnrollment(
    estudianteId: number,
    cursoId: number,
  ): Promise<void> {
    const est = await this.estudianteRepository.findOne({
      where: { id: estudianteId },
      relations: ['cursos'],
    });
    const curso = await this.cursoRepository.findOne({
      where: { id: cursoId },
    });
    if (est && curso && !est.cursos.some((c) => c.id === curso.id)) {
      est.cursos.push(curso);
      await this.estudianteRepository.save(est);
    }
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
