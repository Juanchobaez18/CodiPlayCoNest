import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { In, Repository } from 'typeorm';
import { CreateRoleDto, UpdateRoleDto } from '../dtos/role.dto';
import { ModulesService } from '../../modules/modules.service';

@Injectable()
export class RolesService {

    constructor(
        @InjectRepository(Role) private roleRepo: Repository<Role>,
        private modulesService: ModulesService
    ) { }

    async create(createRoleDto: CreateRoleDto) {
        const { moduleIds, ...rolesData } = createRoleDto;
        const modules = await this.modulesService.findByIds(moduleIds);

        const existingRole = await this.roleRepo.findOne({
            where: { name: createRoleDto.name },
        });

        if (existingRole) {
            throw new BadRequestException('Role name already exists');
        }

        const newRol = this.roleRepo.create({
            ...rolesData,
            modules,
        });
        const role = this.roleRepo.create(newRol);
        return this.roleRepo.save(role);
    }


    async findAll() {
        return this.roleRepo.find();
    }


    async findOne(id: number) {
        const role = await this.roleRepo.findOne({ where: { id } });
        if (!role) {
            throw new NotFoundException(`Role #${id} not found`);
        }
        return role;
    }

    async findByIds(roleIds: number[]) {
        const roles = await this.roleRepo.find({
            where: { id: In(roleIds) },
        });
        return roles;
    }


    // async update(id: number, updateRoleDto: UpdateRoleDto) {
    //     const role = await this.findOne(id);

    //     if (updateRoleDto.name) {
    //         const existingRole = await this.roleRepo.findOne({
    //             where: { name: updateRoleDto.name },
    //         });

    //         if (existingRole && existingRole.id !== id) {
    //             throw new BadRequestException('Role name already exists');
    //         }
    //     }

    //     this.roleRepo.merge(role, updateRoleDto);
    //     return this.roleRepo.save(role);
    // }

    async update(id: number, updateRoleDto: UpdateRoleDto) {
        // 1️⃣ Buscamos el role existente
        const role = await this.findOne(id);
        if (!role) throw new NotFoundException('Role not found');

        // 2️⃣ Validamos que el nuevo nombre no exista en otro rol
        if (updateRoleDto.name) {
            const existingRole = await this.roleRepo.findOne({
                where: { name: updateRoleDto.name },
            });

            if (existingRole && existingRole.id !== id) {
                throw new BadRequestException('Role name already exists');
            }
        }

        // 3️⃣ Si vienen nuevos módulos, los actualizamos
        if (updateRoleDto.moduleIds) {
            const modules = await this.modulesService.findByIds(updateRoleDto.moduleIds);
            if (modules.length !== updateRoleDto.moduleIds.length) {
                throw new NotFoundException('Some modules were not found');
            }
            role.modules = modules;
        }

        // 4️⃣ Mergeamos el resto de los campos
        this.roleRepo.merge(role, updateRoleDto);

        // 5️⃣ Guardamos
        return this.roleRepo.save(role);
    }

    async remove(id: number) {
        // 1. Buscamos el rol incluyendo la relación con usuarios
        const role = await this.roleRepo.findOne({
            where: { id },
            relations: ['users'], // Cargamos los usuarios vinculados
        });

        if (!role) {
            throw new NotFoundException(`Role #${id} not found`);
        }

        // 2. Validamos si el array tiene registros
        if (role.users && role.users.length > 0) {
            throw new BadRequestException(
                `No se puede eliminar el rol: hay ${role.users.length} usuario(s) asignados a él.`
            );
        }

        // 3. Si está limpio, procedemos a borrar
        return await this.roleRepo.remove(role);
    }
    // async remove(id: number) {
    //     const role = await this.findOne(id);
    //     return this.roleRepo.remove(role);
    // }

}
