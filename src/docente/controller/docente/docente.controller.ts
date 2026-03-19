import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { DocenteService } from '../../../docente/service/docente/docente.service';
import { CreateDocenteDto, UpdateDocenteDto } from 'src/docente/dtos/docente.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Modules } from 'src/auth/decorators/modules.decorator';
import { ModulesGuard } from 'src/auth/guards/modules.guard.guard';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@ApiBearerAuth()
@Modules('docentes')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('docentes')
export class DocenteController {

constructor(private readonly docenteService: DocenteService) {}

@Post()
create(@Body() createDocenteDto: CreateDocenteDto) {
    return this.docenteService.create(createDocenteDto);
}

@Get()
findAll() {
    return this.docenteService.findAll();
}

@Get(':id')
findOne(@Param('id') id: string) {
    return this.docenteService.findOne(+id);
}

@Put(':id')
update(@Param('id') id: string, @Body() updateDocenteDto: UpdateDocenteDto) {
    return this.docenteService.update(+id, updateDocenteDto);
}

@Delete(':id')
remove(@Param('id') id: string) {
    return this.docenteService.remove(+id);
}
}