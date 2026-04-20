import { Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToOne, 
    JoinColumn,
  OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Curso } from 'src/curso/entity/curso.entity/curso.entity';
import { Forum } from '../../foros/entities/forum.entity';
import { Mensaje } from 'src/mensajes/entities/mensaje.entity';

@Entity()
export class Docente {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ultimoAcceso: string;

  @Column()
  pagos: number;

  @OneToOne(() => User, (user) => user.docente)
  @JoinColumn() // aquí se crea la FK
  user: User;

  @OneToMany(() => Curso, (curso) => curso.docente)
  cursos: Curso[];

  @OneToMany(() => Forum, forum => forum.docente)
  foros: Forum[];

  @OneToMany(() => Mensaje, (mensaje) => mensaje.docente)
  mensajes: Mensaje[];
}