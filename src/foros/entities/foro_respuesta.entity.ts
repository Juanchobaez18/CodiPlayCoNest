import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Forum } from './forum.entity';
import { Estudiante } from '../../estudiantes/entities/estudiantes.entity';
import { Docente } from '../../docente/entities/docente.entity';

@Entity('foro_respuestas')
export class ForoRespuesta {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  contenido: string;

  @CreateDateColumn()
  fecha_creacion: Date;

  @ManyToOne(() => Forum, (forum) => forum.respuestas)
  foro: Forum;

  @ManyToOne(() => Estudiante, (estudiante) => estudiante.foroRespuestas, { nullable: true, onDelete: 'SET NULL' })
  estudiante: Estudiante | null;

  @ManyToOne(() => Docente, (docente) => docente.foroRespuestas, { nullable: true, onDelete: 'SET NULL' })
  docente: Docente | null;
}