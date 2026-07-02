import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Estudiante } from 'src/estudiantes/entities/estudiantes.entity';
import { Lecciones } from 'src/lecciones/entities/lecciones.entity';

export enum EstadoLeccionProgreso {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
}

@Entity('leccion_progreso')
@Unique(['estudiante', 'leccion'])
export class LeccionProgreso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EstadoLeccionProgreso,
    default: EstadoLeccionProgreso.PENDIENTE,
  })
  estado: EstadoLeccionProgreso;

  @Column({ type: 'text', nullable: true })
  comentario: string | null;

  @CreateDateColumn()
  fechaSolicitud: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaRevision: Date | null;

  @ManyToOne(() => Estudiante, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @ManyToOne(() => Lecciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leccion_id' })
  leccion: Lecciones;
}
