import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/services/users/users.service';
import { RolesService } from 'src/roles/services/roles.service';
import { EstudiantesService } from 'src/estudiantes/service/estudiantes/estudiantes.service';
import * as bcrypt from 'bcrypt';
import { UserModel } from '../../users/interfaces/user';
import { sanitizeUserForJsonResponse } from '../utils/sanitize-user-for-json';
import { RegisterEstudianteDto } from '../dtos/register-estudiante.dto';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly rolesService: RolesService,
        private readonly estudiantesService: EstudiantesService,
    ) { }

    async validateUser(email: string, password: string) {
        const user: User = await this.usersService.findByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { password: _, ...result } = user;
        return sanitizeUserForJsonResponse(
            result as Record<string, unknown>,
        ) as unknown as User;
    }

    async login(user: UserModel) {
        const payload = {
            sub: user.id,
            email: user.email,
            // roles: user.roles.map(r => r.name),
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: sanitizeUserForJsonResponse(user as unknown as Record<string, unknown>),
        };
    }

    async registerEstudiante(dto: RegisterEstudianteDto) {
        // Buscar rol estudiante (case-insensitive, múltiples variantes)
        const role = await this.rolesService.findStudentRole();
        if (!role) {
            throw new BadRequestException(
                'El rol "Estudiante" no existe en el sistema. Pide al administrador que cree el rol con ese nombre.',
            );
        }

        // Crear el usuario con el rol de estudiante
        let newUser: User;
        try {
            newUser = await this.usersService.create({
                name: dto.name,
                lastName: dto.lastName,
                docType: dto.docType,
                docNumber: dto.docNumber,
                email: dto.email,
                password: dto.password,
                isActive: true,
                avatar: '',
                roleIds: [role.id],
            });
        } catch (err: any) {
            if (err?.code === '23505' || err?.message?.includes('unique')) {
                throw new BadRequestException('El correo electrónico ya está registrado.');
            }
            throw err;
        }

        // Crear el perfil de estudiante vinculado al usuario
        await this.estudiantesService.create({
            userId: newUser.id,
            fechanacimiento: dto.fechanacimiento,
            edad: dto.edad,
        });

        // Retornar token + usuario (auto-login)
        const freshUser = await this.usersService.findOne(newUser.id);
        const payload = { sub: freshUser.id, email: freshUser.email };
        return {
            access_token: this.jwtService.sign(payload),
            user: sanitizeUserForJsonResponse(freshUser as unknown as Record<string, unknown>),
        };
    }

    async checkStatus(user: UserModel){
        const id = user.id;

        const dbUser = await this.usersService.findOne(id);
        if (!dbUser) throw new UnauthorizedException();

        const payload = {sub: dbUser.id, email: dbUser.email}

        return {
            user: sanitizeUserForJsonResponse(dbUser as unknown as Record<string, unknown>),
            access_token: this.jwtService.sign(payload),
        }
    }

    // async login(user: UserModel) {
    //     const payload = { sub: user.id, email: user.email };
    //     return {
    //         access_token: this.jwtService.sign(payload),
    //     };
    // }

}
