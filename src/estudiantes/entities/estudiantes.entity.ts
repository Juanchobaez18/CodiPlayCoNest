import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToMany, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Curso } from 'src/curso/entity/curso.entity/curso.entity';
import { Transaction } from 'src/payments/entities/transaction.entity';
import { Mensaje } from '../../mensajes/entities/mensaje.entity';

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
  @JoinColumn() // 🔥 crea la FK
  user: User;

  @ManyToMany(() => Curso, (curso) => curso.estudiantes)
  cursos: Curso[];

  @OneToMany(() => Transaction, (transaction) => transaction.estudiante)
  transactions: Transaction[];

  // Relacion con mensajes

    @OneToMany(() => Mensaje, (mensaje) => mensaje.estudiante)
  mensajes: Mensaje[];
}