import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { RolesService } from 'src/roles/services/roles.service';
import { UsersService } from 'src/users/services/users/users.service';
import { DocenteService } from 'src/docente/service/docente/docente.service';
import { CursoService } from 'src/curso/service/curso/curso.service';
import { EstudiantesService } from 'src/estudiantes/service/estudiantes/estudiantes.service';
import {
  CreateCursoDto,
  UpdateCursoDto,
} from 'src/curso/dto/create-curso.dto/create-curso.dto';
import { AdminRegisterDocenteDto } from './dto/admin-register-docente.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateUserDto } from 'src/users/dtos/user.dto';
import { AdminMailService } from './admin-mail.service';
import { userIsProtectedSystemAdmin } from 'src/auth/config/admin-panel-access.config';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
    private readonly docenteService: DocenteService,
    private readonly cursoService: CursoService,
    private readonly estudiantesService: EstudiantesService,
    private readonly adminMailService: AdminMailService,
  ) {}

  async getDashboardStats() {
    const estudiantes = await this.estudiantesService.findAll();
    const cursos = await this.cursoService.findAll();
    const docentes = await this.docenteService.findAll();

    return {
      totalEstudiantes: estudiantes.length,
      totalCursosActivos: cursos.filter((c) => c.estado).length,
      totalDocentesActivos: docentes.filter((d) => d.user?.isActive).length,
    };
  }

  /**
   * Usuarios que puede ver el panel para gestionar.
   * Incluye administrador, docente y estudiante aunque el nombre del rol en BD varíe
   * (antes se filtraba por texto fijo y podía ocultar al administrador).
   */
  async listManagedUsers() {
    const users = await this.usersService.findAll();
    return users.filter((u) => (u.roles?.length ?? 0) > 0);
  }

  private async resolveDocenteRoleId(): Promise<number> {
    const roles = await this.rolesService.findAll();
    const docente = roles.find((r) => String(r.name).toUpperCase() === 'DOCENTE');
    if (!docente) {
      throw new BadRequestException('No existe un rol DOCENTE en el sistema.');
    }
    return docente.id;
  }

  async registerDocente(dto: AdminRegisterDocenteDto) {
    const exists = await this.userRepo.exists({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException('El correo ya está registrado.');
    }
    const roleId = await this.resolveDocenteRoleId();
    await this.docenteService.create({
      ultimoAcceso: new Date().toISOString(),
      pagos: 0,
      user: {
        name: dto.name,
        lastName: dto.lastName,
        email: dto.email,
        password: dto.password,
        docType: dto.docType,
        docNumber: dto.docNumber,
        isActive: true,
        avatar: dto.avatar?.trim() || 'default.png',
        roleIds: [roleId],
      },
    });
    return { ok: true };
  }

  async deleteManagedUser(id: number) {
    const user = await this.usersService.findOne(id);
    if (userIsProtectedSystemAdmin(user)) {
      throw new BadRequestException(
        'No se puede eliminar un usuario administrador desde este panel.',
      );
    }
    await this.usersService.deleteUser(id);
    return { ok: true };
  }

  private isManagedAdminUser(user: User): boolean {
    return userIsProtectedSystemAdmin(user);
  }

  async toggleManagedUserActive(id: number) {
    const user = await this.usersService.findOne(id);
    if (this.isManagedAdminUser(user)) {
      throw new BadRequestException(
        'No se puede activar ni desactivar un usuario administrador desde este panel.',
      );
    }
    user.isActive = !user.isActive;
    await this.userRepo.save(user);
    return this.usersService.findOne(id);
  }

  async updateManagedUser(id: number, dto: AdminUpdateUserDto) {
    const user = await this.usersService.findOne(id);
    if (this.isManagedAdminUser(user)) {
      throw new BadRequestException(
        'No se puede editar un usuario administrador desde este panel.',
      );
    }
    await this.usersService.updateUser(id, dto as unknown as UpdateUserDto);
    return this.usersService.findOne(id);
  }

  async listStudentEmails() {
    const estudiantes = await this.estudiantesService.findAll();
    return estudiantes
      .map((e) => ({
        id: e.id,
        email: e.user?.email,
        name: e.user?.name,
        lastName: e.user?.lastName,
      }))
      .filter((row) => row.email);
  }

  async sendBulkMail(emails: string[], message: string, subject?: string) {
    const sub = subject?.trim() || 'Mensaje de CodiPlayCo';
    await this.adminMailService.sendBulk(emails, sub, message);
    return { ok: true, sent: emails.length };
  }

  async toggleCursoActivo(id: number) {
    const curso = await this.cursoService.findOne(id);
    await this.cursoService.update(id, { estado: !curso.estado });
    return this.cursoService.findOne(id);
  }

  listDocentes() {
    return this.docenteService.findAll();
  }

  listCursos() {
    return this.cursoService.findAll();
  }

  getCurso(id: number) {
    return this.cursoService.findOne(id);
  }

  createCurso(dto: CreateCursoDto) {
    return this.cursoService.create(dto);
  }

  updateCurso(id: number, dto: UpdateCursoDto) {
    return this.cursoService.update(id, dto);
  }

  deleteCurso(id: number) {
    return this.cursoService.remove(id);
  }

  async listRolesForForms() {
    const roles = await this.rolesService.findAll();
    return roles.map((r) => ({ id: r.id, name: r.name }));
  }
}