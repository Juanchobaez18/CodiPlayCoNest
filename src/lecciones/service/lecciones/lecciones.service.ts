import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLeccionesDto } from 'src/lecciones/dtos/lecciones.dto';
import { Lecciones } from 'src/lecciones/entities/lecciones.entity';
import { CreateUserDto } from 'src/users/dtos/user.dto';
import { Repository } from 'typeorm';

@Injectable()
export class LeccionesService {

    lecciones: Lecciones[] = [];
    constructor(
        @InjectRepository(Lecciones) private leccionesRepo: Repository<Lecciones>,
        private leccionesService: LeccionesService,
    ){}

    async findAll(){
        return await this.leccionesRepo.find({ relations: ['modulos']})
    }


async findByEmail(email:string) {
    const lecciones = await this.leccionesRepo.findOne({
        where: { email },
        relations: {
            modulos:{
             modules: true,
        },
    },
    });
    if (!lecciones){
        throw new NotFoundException('Lecciones ${email} not found');
    }
    return lecciones;
}

async findOne(leccionesId: number){
    const lecciones = await this.leccionesRepo.findOne({
        where: { id: leccionesId },
        relations: []
        });
        if (!lecciones){
            throw new NotFoundException('Lecciones #${leccionesId} not found');
        }
        return lecciones;
}

async create(createLeccionesDto: CreateLeccionesDto){
    const {moduloIds, ...leccionesData} = createLeccionesDto;
    const lecciones = this.leccionesRepo.create(leccionesData);
    const modulos = await this.leccionesService.findByIds(moduloIds);

    if(modulos.length !== moduloIds.length){
        throw new NotFoundException('One or more modulos not found');
    }
    const newLecciones = this.leccionesRepo.create({
        ...leccionesData,
        modulos,
    });
        return await this.leccionesRepo.save(newLecciones);
}
 
deleteLecciones(leccionesId: number){
    return this.leccionesRepo.delete(leccionesId);  
}


}
