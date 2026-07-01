import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

/**
 * Evento emitido cuando el progreso de un estudiante cambia.
 * Los docentes suscriben al canal de sus cursos; los estudiantes
 * suscriben a su propio canal personal.
 */
export interface ProgresoActualizadoEvent {
  estudianteId: number;
  progreso: number;                // 0-100
  leccionesCompletadas: number;   // cantidad total completadas
  leccionId?: number;             // lección recién completada (opcional)
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/progress',
})
export class ProgressGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ProgressGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  /**
   * El cliente docente se une a una sala por cursoId para recibir
   * actualizaciones de todos los estudiantes de ese curso.
   * Uso: socket.emit('join-curso', { cursoId: 5 })
   */
  @SubscribeMessage('join-curso')
  handleJoinCurso(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { cursoId: number },
  ) {
    const room = `curso:${data.cursoId}`;
    client.join(room);
    this.logger.log(`Socket ${client.id} unido a sala ${room}`);
  }

  /**
   * El cliente estudiante se une a su sala personal para recibir
   * confirmación inmediata cuando su progreso es actualizado.
   * Uso: socket.emit('join-estudiante', { estudianteId: 3 })
   */
  @SubscribeMessage('join-estudiante')
  handleJoinEstudiante(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { estudianteId: number },
  ) {
    const room = `estudiante:${data.estudianteId}`;
    client.join(room);
    this.logger.log(`Socket ${client.id} unido a sala ${room}`);
  }

  /**
   * Emite el evento `progreso:actualizado` a todos los docentes
   * suscritos al curso y al estudiante directamente.
   * Llamado desde EstudiantesService y DocentePanelService.
   */
  emitProgresoActualizado(
    cursoIds: number[],
    estudianteId: number,
    data: ProgresoActualizadoEvent,
  ) {
    // Notificar al estudiante directamente
    this.server
      .to(`estudiante:${estudianteId}`)
      .emit('progreso:actualizado', data);

    // Notificar a todos los docentes suscritos a los cursos del estudiante
    for (const cursoId of cursoIds) {
      this.server
        .to(`curso:${cursoId}`)
        .emit('progreso:actualizado', data);
    }
  }
}
