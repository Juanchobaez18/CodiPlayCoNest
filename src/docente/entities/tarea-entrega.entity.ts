import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Tarea } from './tarea.entity';
import { Estudiante } from 'src/estudiantes/entities/estudiantes.entity';

export enum EstadoEntregaTarea {
  ENTREGADO = 'entregado',
  NO_ENTREGADO = 'no_entregado',
  CALIFICADO = 'calificado',
}

export enum ResultadoCalificacion {
  APROBADO = 'APROBADO',
  NO_APROBADO = 'NO_APROBADO',
}

@Entity('tarea_entregas')
export class TareaEntrega {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EstadoEntregaTarea,
    default: EstadoEntregaTarea.NO_ENTREGADO,
  })
  estado: EstadoEntregaTarea;

  @Column({ type: 'varchar', length: 50, nullable: true })
  calificacion: string | null;

  @Column({
    type: 'enum',
    enum: ResultadoCalificacion,
    nullable: true,
  })
  resultado: ResultadoCalificacion | null;

  @CreateDateColumn({ nullable: true })
  fechaEntrega: Date | null;

  @ManyToOne(() => Tarea, (tarea) => tarea.entregas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarea_id' })
  tarea: Tarea;

  @ManyToOne(() => Estudiante, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;
}
