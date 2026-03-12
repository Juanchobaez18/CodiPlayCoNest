import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModuleEntity } from './entities/module.entity';
import { In, Repository } from 'typeorm';
import { CreateModuleDto } from './dtos/create-module.dto';

@Injectable()
export class ModulesService {

    constructor(
        @InjectRepository(ModuleEntity)
        private moduleRepository: Repository<ModuleEntity>,
    ) { }

    async findByIds(ids: number[]) {
        return this.moduleRepository.findBy({ id: In(ids) });
    }

    create(dto: CreateModuleDto) {
        const module = this.moduleRepository.create(dto);
        return this.moduleRepository.save(module);
    }

    findAll() {
        return this.moduleRepository.find();
    }

}