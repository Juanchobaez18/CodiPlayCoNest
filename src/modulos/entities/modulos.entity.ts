import { Curso } from 'src/curso/entity/curso.entity/curso.entity';
import { Lecciones } from 'src/lecciones/entities/lecciones.entity';
import { Entity, 
    PrimaryGeneratedColumn, 
    Column,
    ManyToOne,
    OneToMany, 
} from 'typeorm';


@Entity()
export class Modulos {

@PrimaryGeneratedColumn()
id: number;

@Column()
titulo: string;

@Column('text')
descripcion: string;

@Column()
orden: number;

@Column({ default: false })
completado: boolean;

@Column({ nullable: true })
fechacompletado: string;

@ManyToOne(() => Curso, (curso) => curso.modulos)
curso: Curso;

@OneToMany(() => Lecciones, leccion => leccion.modulo)
lecciones: Lecciones[];

}