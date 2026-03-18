import { Role } from 'src/roles/entities/role.entity';
import { Docente } from '../../docente/entities/docente.entity';
import { Estudiante } from '../../estudiantes/entities/estudiantes.entity';
import { 
    Column, 
    Entity, 
    JoinTable, 
    ManyToMany, 
    PrimaryGeneratedColumn, 
    OneToOne,
    JoinColumn
} from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name;

    @Column({ type: 'varchar', length: 255 })
    lastName;

    @Column({ type: 'varchar', length: 255 })
    docType;

    @Column({ type: 'varchar', length: 255 })
    docNumber;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'varchar', length: 255 })
    avatar: string;

    @ManyToMany(() => Role, role => role.users)
    @JoinTable({
        name: 'user_roles'
    })
    roles: Role[];

    @OneToOne(() => Docente, (docente) => docente.user)
docente: Docente;

@OneToOne(() => Estudiante, (estudiante) => estudiante.user)
estudiante: Estudiante;
}
