import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Estudiante } from '../../estudiantes/entities/estudiantes.entity';
import { Curso } from '../../curso/entity/curso.entity/curso.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('transactions')
@Index(['estudianteId', 'createdAt'])
@Index(['status'])
export class Transaction {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int' })
  estudianteId: number;

  @ManyToOne(() => Estudiante, { eager: false })
  estudiante: Estudiante;

  @Column({ type: 'int' })
  cursoId: number;

  @ManyToOne(() => Curso, { eager: false })
  curso: Curso;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
