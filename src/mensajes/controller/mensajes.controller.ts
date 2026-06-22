import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { MensajesService } from 'src/mensajes/service/mensajes.service';
import { CrearMensajeDto } from 'src/mensajes/dto/crear-mensaje.dto';

@Controller('mensajes')
export class MensajesController {
  constructor(private readonly mensajesService: MensajesService) {}

  @Post()
  crear(@Body() dto: CrearMensajeDto) {
    return this.mensajesService.crear(dto);
  }

  @Get(':estudianteId/:docenteId')
  obtenerConversacion(
    @Param('estudianteId') estudianteId: number,
    @Param('docenteId') docenteId: number,
  ) {
    return this.mensajesService.obtenerConversacion(
      estudianteId,
      docenteId,
    );
  }

  @Patch(':id/leido')
  marcarLeido(@Param('id') id: number) {
    return this.mensajesService.marcarLeido(id);
  }
}