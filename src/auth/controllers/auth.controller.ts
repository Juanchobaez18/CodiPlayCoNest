import { Body, Controller, Get, Header, HttpCode, HttpStatus, Post, Request, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { RegisterEstudianteDto } from '../dtos/register-estudiante.dto';
import { AuthService } from '../services/auth.service';
import { RolesService } from '../../roles/services/roles.service';
import { EstudiantesService } from '../../estudiantes/service/estudiantes/estudiantes.service';
import { JwtAuthGuard } from '../guards/auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly rolesService: RolesService,
        private readonly estudiantesService: EstudiantesService,
    ) {}

    @Get('roles-disponibles')
    @ApiOperation({ summary: 'Lista los roles disponibles (para debug)' })
    async rolesDisponibles() {
        return this.rolesService.findAll();
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Registro público de estudiante' })
    async register(@Body() dto: RegisterEstudianteDto) {
        return this.authService.registerEstudiante(dto);
    }

    @Post('login')
    async login(@Body() body: LoginDto) {
        const user = await this.authService.validateUser(
            body.email,
            body.password,
        );
        return this.authService.login(user);
    }

    @Get('check-status')
    @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    @Header('Pragma', 'no-cache')
    @Header('Expires', '0')
    @UseGuards(JwtAuthGuard)
    checkStatus(@Request() req){
        return this.authService.checkStatus(req.user);
    }

    @Get('perfil-estudiante')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Perfil del estudiante autenticado con sus cursos inscritos' })
    perfilEstudiante(@Request() req) {
        return this.estudiantesService.findByUserId(req.user.id);
    }

    @Get('logout')
    @ApiOperation({ summary: 'Cerrar sesión y redirigir a la landing page' })
    logout(@Res() res: Response) {
        return res.redirect('/');
    }
}
