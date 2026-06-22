import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
  ForbiddenException,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AccesoFuncionalDocenteGuard } from '../../guards/acceso-funcional-docente.guard';
import { DocentePanelService } from '../../service/docente-panel/docente-panel.service';
import {
  SendMensajePanelDto,
  CalificarTareaDto,
  RevisarLeccionProgresoDto,
  CreateForoPanelDto,
  UpdateForoPanelDto,
} from '../../dtos/docente-panel-api.dto';
import { RequiereAccesoDocente } from '../../decorators/acceso-funcional.decorator';

@ApiTags('Docente Panel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccesoFuncionalDocenteGuard)
@RequiereAccesoDocente()
@Controller('docente')
export class DocentePanelController {
  constructor(private readonly docentePanelService: DocentePanelService) {}

  private resolveDocenteId(req: {
    docenteId?: number;
    user?: { docente?: { id?: number } };
  }): number {
    const id = req.docenteId ?? req.user?.docente?.id;
    if (id == null || Number(id) < 1) {
      throw new ForbiddenException(
        'Esta operación requiere un perfil de docente vinculado a su cuenta.',
      );
    }
    return Number(id);
  }

  @Get('dashboard/stats')
  getDashboardStats(@Request() req: { docenteId?: number; user?: { docente?: { id?: number } } }) {
    return this.docentePanelService.getDashboardStats(this.resolveDocenteId(req));
  }

  @Get('cursos')
  getCursos(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Query('estado') estado?: string,
  ) {
    const estadoFilter =
      estado === undefined ? undefined : estado === 'true' || estado === '1';
    return this.docentePanelService.getCursos(
      this.resolveDocenteId(req),
      estadoFilter,
    );
  }

  @Get('cursos/:id')
  getCursoDetalle(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Param('id', ParseIntPipe) cursoId: number,
  ) {
    return this.docentePanelService.getCursoDetalle(
      this.resolveDocenteId(req),
      cursoId,
    );
  }

  @Get('estudiantes')
  getEstudiantes(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Query('cursoId') cursoId?: string,
  ) {
    return this.docentePanelService.getEstudiantes(
      this.resolveDocenteId(req),
      cursoId ? Number(cursoId) : undefined,
    );
  }

  @Get('tareas')
  getTareas(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Query('cursoId') cursoId?: string,
  ) {
    return this.docentePanelService.getTareas(
      this.resolveDocenteId(req),
      cursoId ? Number(cursoId) : undefined,
    );
  }

  @Post('tareas/calificar')
  calificarTarea(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Body() dto: CalificarTareaDto,
  ) {
    return this.docentePanelService.calificarTarea(
      this.resolveDocenteId(req),
      dto,
    );
  }

  @Post('lecciones/revisar')
  revisarLeccionProgreso(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Body() dto: RevisarLeccionProgresoDto,
  ) {
    return this.docentePanelService.revisarLeccionProgreso(
      this.resolveDocenteId(req),
      dto,
    );
  }

  @Get('mensajes')
  getMensajes(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Query('tipo') tipo?: 'enviado' | 'recibido' | 'todos',
  ) {
    return this.docentePanelService.getMensajes(
      this.resolveDocenteId(req),
      tipo ?? 'todos',
    );
  }

  @Post('mensajes')
  sendMensaje(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Body() dto: SendMensajePanelDto,
  ) {
    return this.docentePanelService.sendMensaje(
      this.resolveDocenteId(req),
      dto,
    );
  }

  @Get('foros')
  getForos(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Query('cursoId') cursoId?: string,
  ) {
    return this.docentePanelService.getForos(
      this.resolveDocenteId(req),
      cursoId ? Number(cursoId) : undefined,
    );
  }

  @Post('foros')
  createForo(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Body() dto: CreateForoPanelDto,
  ) {
    return this.docentePanelService.createForo(this.resolveDocenteId(req), dto);
  }

  @Get('foros/:id')
  getForoById(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Param('id', ParseIntPipe) foroId: number,
  ) {
    return this.docentePanelService.getForoById(this.resolveDocenteId(req), foroId);
  }

  @Put('foros/:id')
  updateForo(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Param('id', ParseIntPipe) foroId: number,
    @Body() dto: UpdateForoPanelDto,
  ) {
    return this.docentePanelService.updateForo(this.resolveDocenteId(req), foroId, dto);
  }

  @Delete('foros/:id')
  @HttpCode(200)
  deleteForo(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Param('id', ParseIntPipe) foroId: number,
  ) {
    return this.docentePanelService.deleteForo(this.resolveDocenteId(req), foroId);
  }

  @Get('foros/:id/respuestas')
  getForoRespuestas(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Param('id', ParseIntPipe) foroId: number,
  ) {
    return this.docentePanelService.getForoRespuestas(this.resolveDocenteId(req), foroId);
  }

  @Post('subir-foto')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { foto: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadFoto(
    @Request() req: { userId?: number; user?: { id?: number } },
    @UploadedFile() file?: { buffer: Buffer; mimetype: string; size: number; originalname: string },
  ) {
    const userId = req.userId ?? req.user?.id;
    if (!userId) {
      throw new BadRequestException('Usuario no identificado');
    }
    if (!file) {
      throw new BadRequestException('Debe enviar el archivo en el campo "foto"');
    }
    return this.docentePanelService.uploadFotoPerfil(userId, file);
  }
}
