import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Forum } from '../entities/forum.entity';
import { CreateForumDto, UpdateForumDto } from '../dtos/forum.dto';
import { Docente } from '../../docente/entities/docente.entity';
import { Estudiante } from '../../estudiantes/entities/estudiantes.entity';
import { Modulos } from '../../modulos/entities/modulos.entity';

@Injectable()
export class ForumService {
    constructor(
        @InjectRepository(Forum) private forumRepo: Repository<Forum>,
        @InjectRepository(Docente) private docenteRepo: Repository<Docente>,
        @InjectRepository(Estudiante) private estudianteRepo: Repository<Estudiante>,
        @InjectRepository(Modulos) private moduloRepo: Repository<Modulos>,
    ) {}

    async findAll() {
        return await this.forumRepo.find({ 
            relations: ['estudiantes', 'docente', 'modulo'] 
        });
    }

    async findOne(id: number) {
        const forum = await this.forumRepo.findOne({
            where: { id },
            relations: ['estudiantes', 'docente', 'modulo']
        });
        if (!forum) {
            throw new NotFoundException(`Forum #${id} not found`);
        }
        return forum;
    }

    async create(createForumDto: CreateForumDto) {
        const { docente_id, modulo_id, estudianteIds, ...forumData } = createForumDto;

        // Validar docente si se proporciona
        let docente: Docente | null = null;
        if (docente_id) {
            docente = await this.docenteRepo.findOne({ where: { id: docente_id } });
            if (!docente) {
                throw new NotFoundException(`Docente #${docente_id} not found`);
            }
        }

        // Validar módulo si se proporciona
        let modulo: Modulos | null = null;
        if (modulo_id) {
            modulo = await this.moduloRepo.findOne({ where: { id: modulo_id } });
            if (!modulo) {
                throw new NotFoundException(`Modulo #${modulo_id} not found`);
            }
        }

        // Validar estudiantes si se proporcionan
        let estudiantes: Estudiante[] = [];
        if (estudianteIds && estudianteIds.length > 0) {
            estudiantes = await this.estudianteRepo.findByIds(estudianteIds);
            if (estudiantes.length !== estudianteIds.length) {
                throw new NotFoundException('Some estudiantes were not found');
            }
        }

        const newForum = this.forumRepo.create({
            ...forumData,
            docente,
            modulo,
            estudiantes
        });

        return this.forumRepo.save(newForum);
    }

    async update(id: number, updateForumDto: UpdateForumDto) {
        const { docente_id, modulo_id, estudianteIds, ...forumData } = updateForumDto;

        const forum = await this.forumRepo.findOne({
            where: { id },
            relations: ['estudiantes', 'docente', 'modulo']
        });

        if (!forum) {
            throw new NotFoundException(`Forum #${id} not found`);
        }

        // Actualizar docente si se proporciona
        if (docente_id !== undefined) {
            if (docente_id) {
                const docente = await this.docenteRepo.findOne({ where: { id: docente_id } });
                if (!docente) {
                    throw new NotFoundException(`Docente #${docente_id} not found`);
                }
                forum.docente = docente;
            } else {
                forum.docente = null;
            }
        }

        // Actualizar módulo si se proporciona
        if (modulo_id !== undefined) {
            if (modulo_id) {
                const modulo = await this.moduloRepo.findOne({ where: { id: modulo_id } });
                if (!modulo) {
                    throw new NotFoundException(`Modulo #${modulo_id} not found`);
                }
                forum.modulo = modulo;
            } else {
                forum.modulo = null;
            }
        }

        // Actualizar estudiantes si se proporciona
        if (estudianteIds !== undefined) {
            if (estudianteIds && estudianteIds.length > 0) {
                const estudiantes = await this.estudianteRepo.findByIds(estudianteIds);
                if (estudiantes.length !== estudianteIds.length) {
                    throw new NotFoundException('Some estudiantes were not found');
                }
                forum.estudiantes = estudiantes;
            } else {
                forum.estudiantes = [];
            }
        }

        // Actualizar resto de datos
        this.forumRepo.merge(forum, forumData);

        return this.forumRepo.save(forum);
    }

    async delete(id: number) {
        const forum = await this.forumRepo.findOne({ where: { id } });
        if (!forum) {
            throw new NotFoundException(`Forum #${id} not found`);
        }
        return this.forumRepo.delete(id);
    }
}
