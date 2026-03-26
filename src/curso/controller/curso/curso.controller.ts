import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';

import { CursoService } from 'src/curso/service/curso/curso.service';
import { CreateCursoDto, UpdateCursoDto} from 'src/curso/dto/create-curso.dto/create-curso.dto';


@Controller('curso')
export class CursoController {
  constructor(private readonly cursoService: CursoService) {}

  @Post()
  create(@Body() data: CreateCursoDto) {
    return this.cursoService.create(data);
  }

  @Get()
  findAll() {
    return this.cursoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cursoService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateCursoDto) {
    return this.cursoService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cursoService.remove(+id);
  }
}