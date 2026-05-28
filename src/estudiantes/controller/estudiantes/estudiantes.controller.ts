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
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('estudiantes')
export class EstudiantesController {

    constructor(private readonly estudiantesService: EstudiantesService) {}

    @Get('mi-perfil')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Obtener perfil e inscripciones del estudiante autenticado' })
    getMiPerfil(@Request() req) {
        return this.estudiantesService.findByUserId(req.user.id);
    }

    @Post('mis-lecciones/:leccionId/completar')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Marcar una lección como completada por el estudiante autenticado' })
    marcarLeccionCompletada(@Request() req, @Param('leccionId', ParseIntPipe) leccionId: number) {
        return this.estudiantesService.marcarLeccionCompletada(req.user.id, leccionId);
    }

    @Get()
    @Modules('estudiantes')
    @ApiOperation({ summary: 'Obtener todos los estudiantes' })
    @ApiResponse({ status: 200, description: 'Lista de estudiantes' })
    findAll() {
        return this.estudiantesService.findAll();
    }
    @Get('by-user/:userId')
@ApiOperation({ summary: 'Obtener estudiante por ID de usuario' })
findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.estudiantesService.findByUserId(userId);
}

    @Get(':id')
    @Modules('estudiantes')
    @ApiOperation({ summary: 'Obtener un estudiante por ID' })
    @ApiResponse({ status: 200, description: 'Estudiante encontrado' })
    @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.estudiantesService.findOne(id);
    }

    @Post()
    @Modules('estudiantes')
    @ApiOperation({ summary: 'Crear un nuevo estudiante' })
    @ApiResponse({ status: 201, description: 'Estudiante creado exitosamente' })
    create(@Body() createEstudianteDto: CreateEstudianteDto) {
        return this.estudiantesService.create(createEstudianteDto);
    }

    @Put(':id')
    @Modules('estudiantes')
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
    @Modules('estudiantes')
    @HttpCode(204)
    @ApiOperation({ summary: 'Eliminar un estudiante por ID' })
    @ApiResponse({ status: 204, description: 'Estudiante eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.estudiantesService.remove(id);
    }
}
