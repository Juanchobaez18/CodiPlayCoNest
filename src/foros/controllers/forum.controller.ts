import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Modules } from '../../auth/decorators/modules.decorator';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { PanelOModulosGuard } from '../../docente/guards/panel-o-modulos.guard';
import { DocentePanelService } from '../../docente/service/docente-panel/docente-panel.service';
import {
  CreateForoPanelDto,
  UpdateForoPanelDto,
} from '../../docente/dtos/docente-panel-api.dto';
import { ForumService } from '../services/forum.service';
import { CreateForumDto, UpdateForumDto } from '../dtos/forum.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PanelOModulosGuard)
@Controller('foros')
export class ForumController {
  constructor(
    private readonly forumService: ForumService,
    private readonly docentePanelService: DocentePanelService,
  ) {}

  private resolveDocenteId(req: {
    docenteId?: number;
    user?: { docente?: { id?: number } };
  }): number | null {
    const id = req.docenteId ?? req.user?.docente?.id;
    return id != null && Number(id) > 0 ? Number(id) : null;
  }

  @Modules('foros')
  @Get()
  getForums() {
    return this.forumService.findAll();
  }

  @Get(':id')
  getOne(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const docenteId = this.resolveDocenteId(req);
    if (docenteId) {
      return this.docentePanelService.getForoById(docenteId, id);
    }
    return this.forumService.findOne(id);
  }

  @Post()
  createForum(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Body() payload: CreateForoPanelDto | CreateForumDto,
  ) {
    const docenteId = this.resolveDocenteId(req);
    if (docenteId && 'cursoId' in payload) {
      return this.docentePanelService.createForo(
        docenteId,
        payload as CreateForoPanelDto,
      );
    }
    return this.forumService.create(payload as CreateForumDto);
  }

  @Put(':id')
  updateForum(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateForoPanelDto | UpdateForumDto,
  ) {
    const docenteId = this.resolveDocenteId(req);
    if (docenteId) {
      return this.docentePanelService.updateForo(
        docenteId,
        id,
        payload as UpdateForoPanelDto,
      );
    }
    return this.forumService.update(id, payload as UpdateForumDto);
  }

  @Delete(':id')
  deleteForum(
    @Request() req: { docenteId?: number; user?: { docente?: { id?: number } } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const docenteId = this.resolveDocenteId(req);
    if (docenteId) {
      return this.docentePanelService.deleteForo(docenteId, id);
    }
    return this.forumService.delete(id);
  }
}
