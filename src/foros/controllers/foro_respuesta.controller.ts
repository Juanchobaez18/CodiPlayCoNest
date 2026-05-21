import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { PanelOModulosGuard } from '../../docente/guards/panel-o-modulos.guard';
import { DocentePanelService } from '../../docente/service/docente-panel/docente-panel.service';
import { ForoRespuestaService } from '../services/foro_respuesta.service';
import { CrearForoRespuestaDto } from '../dtos/crear_foro_respuesta.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PanelOModulosGuard)
@Controller('foros')
export class ForoRespuestaController {
  constructor(
    private readonly foroRespuestaService: ForoRespuestaService,
    private readonly docentePanelService: DocentePanelService,
  ) {}

  private resolveDocenteId(req: {
    docenteId?: number;
    user?: { docente?: { id?: number } };
  }): number | null {
    const id = req.docenteId ?? req.user?.docente?.id;
    return id != null && Number(id) > 0 ? Number(id) : null;
  }

  @Post(':foroId/respuestas')
  crear(
    @Param('foroId', ParseIntPipe) foroId: number,
    @Body() dto: CrearForoRespuestaDto,
  ) {
    dto.foroId = foroId;
    return this.foroRespuestaService.crear(dto);
  }

  @Get(':foroId/respuestas')
  obtenerPorForo(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Param('foroId', ParseIntPipe) foroId: number,
  ) {
    const docenteId = this.resolveDocenteId(req);
    if (docenteId) {
      return this.docentePanelService.getForoRespuestas(docenteId, foroId);
    }
    return this.foroRespuestaService.obtenerPorForo(foroId);
  }
}
