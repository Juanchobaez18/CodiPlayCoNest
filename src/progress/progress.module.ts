import { Module } from '@nestjs/common';
import { ProgressGateway } from './progress.gateway';

/**
 * Módulo que expone el ProgressGateway WebSocket.
 * Se exporta el gateway para que otros módulos puedan
 * inyectarlo y emitir eventos de progreso.
 */
@Module({
  providers: [ProgressGateway],
  exports: [ProgressGateway],
})
export class ProgressModule {}
