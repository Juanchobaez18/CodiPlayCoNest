import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';
import { Modules } from '../../auth/decorators/modules.decorator';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
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
    const estudianteId = req.user.sub;
    return await this.paymentsService.create(estudianteId, createPaymentDto);
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
    const estudianteId = req.user.sub;
    return await this.paymentsService.getByStudent(
      estudianteId,
      parseInt(page),
      parseInt(limit),
    );
  }

  /**
   * GET /payments/admin/all - Obtener TODAS las transacciones (admin)
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @Modules('payments')
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
    @Body() updateData: Partial<Transaction>,
  ): Promise<Transaction> {
    return await this.paymentsService.update(id, updateData);
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
