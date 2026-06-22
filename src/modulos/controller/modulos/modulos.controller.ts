import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ModulosService } from '../../../modulos/service/modulos/modulos.service';
import { CreateModulosDto, UpdateModulosDto } from 'src/modulos/dtos/modulos.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Modules } from 'src/auth/decorators/modules.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ModulesGuard } from 'src/auth/guards/modules.guard.guard';

@ApiBearerAuth()
@Modules('modulos')
//@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('modulos')
export class ModulosController {

  constructor(private readonly modulosService: ModulosService) {}

  @Post()
  create(@Body() dto: CreateModulosDto) {
    return this.modulosService.create(dto);
  }

  @Get()
  findAll() {
    return this.modulosService.findAll();
  }

  @Get('by-curso/:cursoId')
  findByCurso(@Param('cursoId') cursoId: string) {
    return this.modulosService.findByCurso(+cursoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modulosService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateModulosDto) {
    return this.modulosService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modulosService.remove(+id);
  }
}