import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToMany, 
    ManyToOne,
    OneToOne,
    JoinTable,
    JoinColumn,
    CreateDateColumn
} from 'typeorm';
import { Estudiante } from '../../estudiantes/entities/estudiantes.entity';
import { Docente } from '../../docente/entities/docente.entity';
import { Modulos } from '../../modulos/entities/modulos.entity';
import { Curso } from '../../curso/entity/curso.entity/curso.entity';
import { OneToMany } from 'typeorm';
import { ForoRespuesta } from './foro_respuesta.entity';

@Entity()
export class Forum {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    titulo: string;

    @Column({ type: 'text' })
    descripcion: string;

    @CreateDateColumn()
    fecha_creacion: Date;

    @ManyToMany(() => Estudiante, estudiante => estudiante.foros)
    @JoinTable({
        name: 'forum_estudiantes',
        joinColumn: { name: 'forum_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'estudiante_id', referencedColumnName: 'id' }
    })
    estudiantes: Estudiante[];

    @ManyToOne(() => Docente, docente => docente.foros, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'docente_id' })
    docente: Docente | null;

    @OneToOne(() => Modulos, modulo => modulo.forum, { nullable: true })
    @JoinColumn({ name: 'modulo_id' })
    modulo: Modulos | null;

    @ManyToOne(() => Curso, { nullable: true })
    @JoinColumn({ name: 'curso_id' })
    curso: Curso | null;

    @OneToMany(() => ForoRespuesta, (respuesta) => respuesta.foro)
    respuestas: ForoRespuesta[];
}
