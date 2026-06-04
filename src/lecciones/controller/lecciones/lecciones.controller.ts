import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Modules } from 'src/auth/decorators/modules.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ModulesGuard } from 'src/auth/guards/modules.guard.guard';
import { CreateLeccionesDto, UpdateLeccionesDto } from 'src/lecciones/dtos/lecciones.dto';
import { LeccionesService } from 'src/lecciones/service/lecciones/lecciones.service';


@ApiBearerAuth()
@Controller('lecciones')
export class LeccionesController {

constructor(private leccionesService: LeccionesService){}

@Get()
@Modules('lecciones')
@UseGuards(JwtAuthGuard, ModulesGuard)
getLeciones(){
    return this.leccionesService.findAll();
}

@Get(':leccionesId')
@UseGuards(JwtAuthGuard)
getOne(@Param('leccionesId', ParseIntPipe) leccionesId: number){
    return this.leccionesService.findOne(leccionesId);
}

@Post()
@Modules('lecciones')
@UseGuards(JwtAuthGuard, ModulesGuard)
createLecciones(@Body() payload: CreateLeccionesDto){
    return this.leccionesService.create(payload);
}

@Put(':leccionesId')
@Modules('lecciones')
@UseGuards(JwtAuthGuard, ModulesGuard)
updateLecciones(@Param('leccionesId', ParseIntPipe) leccionesId: number, @Body() payloadUpdate: UpdateLeccionesDto){
    return this.leccionesService.updateLecciones(leccionesId, payloadUpdate);
}

@Delete(':leccionesId')
@Modules('lecciones')
@UseGuards(JwtAuthGuard, ModulesGuard)
deleteLecciones(@Param('leccionesId', ParseIntPipe) leccionesId: number){
    this.leccionesService.deleteLecciones(leccionesId);
}

}
