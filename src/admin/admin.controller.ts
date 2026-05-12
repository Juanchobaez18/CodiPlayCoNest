import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AdminPanelGuard } from 'src/auth/guards/admin-panel.guard';
import { AdminService } from './admin.service';
import { AdminBulkMailDto } from './dto/admin-bulk-mail.dto';
import { AdminRegisterDocenteDto } from './dto/admin-register-docente.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import {
  CreateCursoDto,
  UpdateCursoDto,
} from 'src/curso/dto/create-curso.dto/create-curso.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminPanelGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users/managed')
  listManagedUsers() {
    return this.adminService.listManagedUsers();
  }

  @Delete('users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteManagedUser(id);
  }

  @Put('users/:id')
  updateManagedUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.adminService.updateManagedUser(id, dto);
  }

  @Patch('users/:id/toggle-active')
  toggleManagedUserActive(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleManagedUserActive(id);
  }

  @Get('students/emails')
  listStudents() {
    return this.adminService.listStudentEmails();
  }

  @Post('messages/bulk')
  sendBulk(@Body() dto: AdminBulkMailDto) {
    return this.adminService.sendBulkMail(dto.emails, dto.message, dto.subject);
  }

  @Post('docentes')
  registerDocente(@Body() dto: AdminRegisterDocenteDto) {
    return this.adminService.registerDocente(dto);
  }

  @Get('docentes')
  listDocentes() {
    return this.adminService.listDocentes();
  }

  @Get('form/roles')
  listRolesForForms() {
    return this.adminService.listRolesForForms();
  }

  @Get('cursos')
  listCursos() {
    return this.adminService.listCursos();
  }

  @Get('cursos/:id')
  getCurso(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getCurso(id);
  }

  @Post('cursos')
  createCurso(@Body() dto: CreateCursoDto) {
    return this.adminService.createCurso(dto);
  }

  @Put('cursos/:id')
  updateCurso(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCursoDto,
  ) {
    return this.adminService.updateCurso(id, dto);
  }

  @Delete('cursos/:id')
  deleteCurso(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCurso(id);
  }

  @Patch('cursos/:id/toggle-active')
  toggleCurso(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleCursoActivo(id);
  }
}
