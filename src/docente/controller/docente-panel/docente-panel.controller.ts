import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { DocentePanelService } from '../../service/docente-panel/docente-panel.service';
import { SendMensajeDto, CreateTareaDto } from '../../dtos/docente-dashboard.dto';

@ApiTags('Docente Panel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('docente')
export class DocentePanelController {
  constructor(private readonly docentePanelService: DocentePanelService) {}

  private resolveDocenteId(req: { user?: { docente?: { id?: number } } }): number {
    const id = req.user?.docente?.id;
    if (id == null || Number(id) < 1) {
      throw new ForbiddenException(
        'Esta área requiere un perfil de docente asociado a la cuenta.',
      );
    }
    return Number(id);
  }

  /**
   * Obtener estadísticas del dashboard del docente autenticado
   */
  @Get('dashboard/stats')
  async getDashboardStats(@Request() req: any) {
    const docenteId = this.resolveDocenteId(req);
    return this.docentePanelService.getDashboardStats(docenteId);
  }

  /**
   * Obtener cursos del docente autenticado
   */
  @Get('cursos')
  async getCursos(@Request() req: any) {
    const docenteId = this.resolveDocenteId(req);
    return this.docentePanelService.getCursos(docenteId);
  }

  /**
   * Obtener detalles de un curso específico
   */
  @Get('cursos/:id')
  async getCursoDetalle(
    @Request() req: any,
    @Param('id', ParseIntPipe) cursoId: number,
  ) {
    const docenteId = this.resolveDocenteId(req);
    return this.docentePanelService.getCursoDetalle(docenteId, cursoId);
  }

  /**
   * Obtener estudiantes del docente autenticado
   */
  @Get('estudiantes')
  async getEstudiantes(@Request() req: any) {
    const docenteId = this.resolveDocenteId(req);
    return this.docentePanelService.getEstudiantes(docenteId);
  }

  /**
   * Obtener tareas del docente autenticado
   */
  @Get('tareas')
  async getTareas(@Request() req: any) {
    const docenteId = this.resolveDocenteId(req);
    return this.docentePanelService.getTareas(docenteId);
  }

  /**
   * Obtener mensajes del docente autenticado
   */
  @Get('mensajes')
  async getMensajes(@Request() req: any) {
    const docenteId = this.resolveDocenteId(req);
    return this.docentePanelService.getMensajes(docenteId);
  }

  /**
   * Obtener foros del docente autenticado
   */
  @Get('foros')
  async getForos(@Request() req: any) {
    const docenteId = this.resolveDocenteId(req);
    return this.docentePanelService.getForos(docenteId);
  }

  /**
   * Crear una nueva tarea
   */
  @Post('tareas')
  async createTarea(@Request() req: any, @Body() dto: CreateTareaDto) {
    const docenteId = this.resolveDocenteId(req);
    return this.docentePanelService.createTarea(docenteId, dto);
  }

  /**
   * Enviar un mensaje
   */
  @Post('mensajes')
  async sendMensaje(@Request() req: any, @Body() dto: SendMensajeDto) {
    const docenteId = this.resolveDocenteId(req);
    return this.docentePanelService.sendMensaje(docenteId, dto);
  }

  /**
   * Actualizar un curso
   */
  @Put('cursos/:id')
  async updateCurso(
    @Request() req: any,
    @Param('id', ParseIntPipe) cursoId: number,
    @Body() dto: any,
  ) {
    const docenteId = this.resolveDocenteId(req);
    return this.docentePanelService.updateCurso(docenteId, cursoId, dto);
  }
}
