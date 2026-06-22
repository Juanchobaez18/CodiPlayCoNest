import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  OneToMany,
  
} from 'typeorm';
import { Transaction } from 'src/payments/entities/transaction.entity';
import { Docente } from 'src/docente/entities/docente.entity';
import { Estudiante } from 'src/estudiantes/entities/estudiantes.entity';
import { Modulos } from 'src/modulos/entities/modulos.entity';


@Entity()
export class Curso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column('text')
  descripcion: string;

  @Column()
  dificultad: string;

  @Column('decimal')
  precio: number;

  @Column({ default: true })
  estado: boolean;

  // 🔹 Relación: muchos cursos → un docente
  @ManyToOne(() => Docente, (docente) => docente.cursos, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'docente_id' })
  docente: Docente | null;

  @OneToMany(() => Modulos, (modulos) => modulos.curso)
 modulos: Modulos[];

  // 🔹 Relación: muchos cursos ↔ muchos estudiantes
  @ManyToMany(() => Estudiante, (estudiante) => estudiante.cursos)
  @JoinTable({
    name: 'curso_estudiantes', // tabla intermedia
    joinColumn: {
      name: 'curso_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'estudiante_id',
      referencedColumnName: 'id',
    },
  })
  estudiantes: Estudiante[];

  // 🔹 Relación: muchas transacciones → un curso
@OneToMany(() => Transaction, (transaction: Transaction) => transaction.curso)
  transactions: Transaction[];
}