import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from 'src/users/dtos/user.dto';
import { RolesService } from 'src/roles/services/roles.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

    users: User[] = [];
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private rolesService: RolesService,
    ) { }

    async findAll() {
        return await this.userRepo.find({ relations: ['roles'] });
    }

    // async findByEmail(email: string) {
    //     const user = await this.userRepo.findOne({ where: { email: email } });
    //     if (!user) {
    //         throw new NotFoundException(`User ${email} not found`);
    //     }
    //     return user;
    // }



    async findByEmail(email: string) {
        const user = await this.userRepo.findOne({
            where: { email },
            relations: {
                roles: {
                    modules: true,
                },
            },
            // relations: ['roles'], //clave
        });

        if (!user) {
            throw new NotFoundException(`User ${email} not found`);
        }
        return user;
    }

    async findOne(userId: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: {
                roles: {
                    modules: true,
                },
            },
        });
        if (!user) {
            throw new NotFoundException(`User #${userId} not found`);
        }
        return user;
    }

    // createUser(payload: CreateUserDto){
    //     const newUser = this.userRepo.create(payload);
    //     return this.userRepo.save(newUser);
    // }

    async create(createUserDto: CreateUserDto) {
        const { roleIds, password, ...userData } = createUserDto;
        const hashedPassword = await bcrypt.hash(password, 10);
        const roles = await this.rolesService.findByIds(roleIds);

        if (roles.length !== roleIds.length) {
            throw new NotFoundException('Some roles were not found');
        }

        const newUser = this.userRepo.create({
            ...userData,
            password: hashedPassword, //Guardamos la encriptada
            roles,
        });
        return this.userRepo.save(newUser);
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto) {
        const { roleIds, password, ...userData } = updateUserDto;

        const user = await this.userRepo.findOne({
            where: { id },
            relations: ['roles'],
        });

        if (!user) throw new NotFoundException('User not found');

        // actualizar roles
        if (roleIds) {
            const roles = await this.rolesService.findByIds(roleIds);

            if (roles.length !== roleIds.length) {
                throw new NotFoundException('Some roles were not found');
            }

            user.roles = roles;
        }

        // actualizar password solo si viene
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        // actualizar resto de datos
        this.userRepo.merge(user, userData);

        return this.userRepo.save(user);
    }

    // async updateUser(id: number, payloadUpdated: UpdateUserDto) {
    //     const user = await this.userRepo.findOne({ where: { id } });
    //     if (!user) {
    //         throw new NotFoundException(`User #${id} not found`);
    //     }
    //     this.userRepo.merge(user, payloadUpdated);
    // }

    deleteUser(idUser: number) {
        return this.userRepo.delete(idUser);
    }
}
