import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToMany, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Curso } from 'src/curso/entity/curso.entity/curso.entity';
import { Transaction } from 'src/payments/entities/transaction.entity';
import { Forum } from '../../foros/entities/forum.entity';
import { Mensaje } from 'src/mensajes/entities/mensaje.entity';
import { ForoRespuesta } from 'src/foros/entities/foro_respuesta.entity';

@Entity()
export class Estudiante {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fechanacimiento: string;

  @Column()
  edad: number;

  @Column({ nullable: true })
  fecharegistro: string;

  @OneToOne(() => User, (user) => user.estudiante)
  @JoinColumn()
  user: User;

  @ManyToMany(() => Curso, (curso) => curso.estudiantes)
  cursos: Curso[];

  @OneToMany(() => Transaction, (transaction) => transaction.estudiante)
  transactions: Transaction[];

  @ManyToMany(() => Forum, (forum) => forum.estudiantes)
  foros: Forum[];

  @OneToMany(() => Mensaje, (mensaje) => mensaje.estudiante)
  mensajes: Mensaje[];

  @OneToMany(() => ForoRespuesta, (respuesta) => respuesta.estudiante)
foroRespuestas: ForoRespuesta[];
}