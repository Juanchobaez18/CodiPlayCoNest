import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    UseGuards,
    HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EstudiantesService } from '../../service/estudiantes/estudiantes.service';
import { CreateEstudianteDto, UpdateEstudianteDto } from '../../dtos/estudiante.dto';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { Modules } from '../../../auth/decorators/modules.decorator';

@ApiTags('Estudiantes')
@ApiBearerAuth()
@Modules('estudiantes')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('estudiantes')
export class EstudiantesController {

    constructor(private readonly estudiantesService: EstudiantesService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener todos los estudiantes' })
    @ApiResponse({ status: 200, description: 'Lista de estudiantes' })
    findAll() {
        return this.estudiantesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un estudiante por ID' })
    @ApiResponse({ status: 200, description: 'Estudiante encontrado' })
    @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.estudiantesService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo estudiante' })
    @ApiResponse({ status: 201, description: 'Estudiante creado exitosamente' })
    create(@Body() createEstudianteDto: CreateEstudianteDto) {
        return this.estudiantesService.create(createEstudianteDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un estudiante por ID' })
    @ApiResponse({ status: 200, description: 'Estudiante actualizado exitosamente' })
    @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEstudianteDto: UpdateEstudianteDto,
    ) {
        return this.estudiantesService.update(id, updateEstudianteDto);
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({ summary: 'Eliminar un estudiante por ID' })
    @ApiResponse({ status: 204, description: 'Estudiante eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.estudiantesService.remove(id);
    }
}
