import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Docente } from './docente.entity';
import { Curso } from 'src/curso/entity/curso.entity/curso.entity';
import { Modulos } from 'src/modulos/entities/modulos.entity';
import { Lecciones } from 'src/lecciones/entities/lecciones.entity';
import { TareaEntrega } from './tarea-entrega.entity';

export enum EstadoTareaEntidad {
  PENDIENTE = 'pendiente',
  CALIFICADA = 'calificada',
  VENCIDA = 'vencida',
}

@Entity('tareas')
export class Tarea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  titulo: string;

  @Column('text')
  descripcion: string;

  @Column({ type: 'timestamp' })
  fechaVencimiento: Date;

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({
    type: 'enum',
    enum: EstadoTareaEntidad,
    default: EstadoTareaEntidad.PENDIENTE,
  })
  estado: EstadoTareaEntidad;

  @ManyToOne(() => Docente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'docente_id' })
  docente: Docente;

  @ManyToOne(() => Curso, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curso_id' })
  curso: Curso;

  @ManyToOne(() => Modulos, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'modulo_id' })
  modulo: Modulos | null;

  @ManyToOne(() => Lecciones, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'leccion_id' })
  leccion: Lecciones | null;

  @OneToMany(() => TareaEntrega, (entrega) => entrega.tarea)
  entregas: TareaEntrega[];
}
