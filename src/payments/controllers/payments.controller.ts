import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  Req,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { PaymentsService } from '../services/payments.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Modules } from '../../auth/decorators/modules.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { UpdatePaymentDto } from '../dtos/update-payment.dto';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  /**
   * POST /payments - Crear nueva transacción de pago
   */
  @Post()
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @Modules('payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva transacción de pago' })
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req,
  ): Promise<Transaction> {
    // req.user es el objeto User completo que devuelve JwtStrategy.validate()
    const userId = req.user.id;
    return await this.paymentsService.create(userId, createPaymentDto);
  }

  @Post('stripe/checkout')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @Modules('payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear PaymentIntent de Stripe para una transacción' })
  async createStripeCheckout(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return await this.paymentsService.createStripePaymentIntent(
      userId,
      createPaymentDto,
    );
  }

  @Post('stripe/create-session')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear sesión de Stripe Checkout y devolver URL de pago' })
  async createCheckoutSession(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return await this.paymentsService.createStripeCheckoutSession(
      userId,
      createPaymentDto,
    );
  }

  @Get('confirm-enrollment')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Confirmar inscripción al curso tras pago exitoso de Stripe' })
  async confirmEnrollment(
    @Request() req,
    @Query('transaccionId', ParseIntPipe) transaccionId: number,
  ) {
    return await this.paymentsService.confirmEnrollment(req.user.id, transaccionId);
  }

  @Post('stripe/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Procesar webhook de Stripe' })
  async stripeWebhook(@Req() req: ExpressRequest) {
    const signature = req.headers['stripe-signature'] as string;
    const payload = req.body as Buffer;

    await this.paymentsService.handleStripeWebhook(signature, payload);

    return { received: true };
  }

  /**
   * GET /payments - Obtener transacciones del usuario autenticado
   */
  @Get()
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @Modules('payments')
  @ApiOperation({ summary: 'Obtener mis transacciones de pago' })
  async getMyTransactions(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const userId = req.user.id;
    return await this.paymentsService.getByStudent(
      userId,
      parseInt(page),
      parseInt(limit),
    );
  }

  /**
   * GET /payments/admin/all - Obtener TODAS las transacciones (solo admin)
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, ModulesGuard, RolesGuard)
  @Modules('payments')
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener todas las transacciones (Admin)' })
  async getAllTransactions(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status: TransactionStatus,
    @Query('estudianteId') estudianteId: string,
    @Query('cursoId') cursoId: string,
  ) {
    const filters: any = {};
    if (status) filters.status = status;
    if (estudianteId) filters.estudianteId = parseInt(estudianteId);
    if (cursoId) filters.cursoId = parseInt(cursoId);

    return await this.paymentsService.findAll(
      parseInt(page),
      parseInt(limit),
      filters,
    );
  }

  /**
   * GET /payments/:id - Obtener detalle de una transacción
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @Modules('payments')
  @ApiOperation({ summary: 'Obtener detalle de una transacción' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Transaction> {
    return await this.paymentsService.findOne(id);
  }

  /**
   * PUT /payments/:id - Actualizar una transacción
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @Modules('payments')
  @ApiOperation({ summary: 'Actualizar transacción (status, amount, metadata)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<Transaction> {
    return await this.paymentsService.update(id, updatePaymentDto);
  }

  /**
   * DELETE /payments/:id - Eliminar una transacción
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @Modules('payments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una transacción' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.paymentsService.remove(id);
  }
}
