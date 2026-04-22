import { Controller, Post, Get, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ForoRespuestaService } from '../services/foro_respuesta.service';
import { CrearForoRespuestaDto } from '../dtos/crear_foro_respuesta.dto';

@Controller('foros')
export class ForoRespuestaController {

  constructor(private readonly foroRespuestaService: ForoRespuestaService) {}

  @Post(':foroId/respuestas')
  crear(
    @Param('foroId', ParseIntPipe) foroId: number,
    @Body() dto: CrearForoRespuestaDto,
  ) {
    dto.foroId = foroId;
    return this.foroRespuestaService.crear(dto);
  }

  @Get(':foroId/respuestas')
  obtenerPorForo(@Param('foroId', ParseIntPipe) foroId: number) {
    return this.foroRespuestaService.obtenerPorForo(foroId);
  }
}