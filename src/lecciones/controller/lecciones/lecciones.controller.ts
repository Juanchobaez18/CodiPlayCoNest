import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Modules } from 'src/auth/decorators/modules.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ModulesGuard } from 'src/auth/guards/modules.guard.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateLeccionesDto, UpdateLeccionesDto } from 'src/lecciones/dtos/lecciones.dto';
import { LeccionesService } from 'src/lecciones/service/lecciones/lecciones.service';


@ApiBearerAuth()
@Modules('lecciones')
@UseGuards(JwtAuthGuard, ModulesGuard, RolesGuard)
@Controller('lecciones')
export class LeccionesController {

constructor(private leccionesService: LeccionesService){}

@Get()
@Roles('admin', 'estudiante')
getLeciones(){
    return this.leccionesService.findAll();
}

@Get(':leccionesId')
@Roles('admin', 'estudiante')
getOne(@Param('leccionesId', ParseIntPipe) leccionesId: number){
    return this.leccionesService.findOne(leccionesId);
}

@Post()
@Roles('admin')
createLecciones(@Body() payload: CreateLeccionesDto){
    return this.leccionesService.create(payload);
}

@Put(':leccionesId')
@Roles('admin')
updateLecciones(@Param('leccionesId', ParseIntPipe) leccionesId: number, @Body() payloadUpdate: UpdateLeccionesDto){
    return this.leccionesService.updateLecciones(leccionesId, payloadUpdate);
}

@Delete(':leccionesId')
@Roles('admin')
deleteLecciones(@Param('leccionesId', ParseIntPipe) leccionesId: number){
    return this.leccionesService.deleteLecciones(leccionesId);
}

@Post(':leccionesId/completar')
@Roles('admin', 'estudiante')
completarLeccion(
  @Param('leccionesId', ParseIntPipe) leccionesId: number,
  @Body() body: { estado: string; notas: string; tiempo_total_minutos: number },
  @Req() request: Request
) {
  return this.leccionesService.completarLeccion(leccionesId, body, request);
}
}
