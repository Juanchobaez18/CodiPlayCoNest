import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Lecciones } from './lecciones.entity';
import { Estudiante } from 'src/estudiantes/entities/estudiantes.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('progreso_lecciones')
@Unique(['estudiante', 'leccion']) // Un estudiante solo puede tener un registro por lección
export class ProgresoLeccion {
  @ApiProperty({ description: 'ID del registro de progreso' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Estudiante que está tomando la lección' })
  @ManyToOne(() => Estudiante)
  estudiante: Estudiante;

  @ApiProperty({ description: 'Lección que está siendo tomada' })
  @ManyToOne(() => Lecciones)
  leccion: Lecciones;

  @ApiProperty({ 
    description: 'Estado de la lección',
    enum: ['pendiente', 'en_progreso', 'completada'],
    default: 'pendiente'
  })
  @Column({
    type: 'enum',
    enum: ['pendiente', 'en_progreso', 'completada'],
    default: 'pendiente'
  })
  estado: string;

  @ApiProperty({ 
    description: 'Fecha de inicio de la lección',
    required: false 
  })
  @Column({ type: 'timestamp', nullable: true })
  fecha_inicio: Date;

  @ApiProperty({ 
    description: 'Fecha de completado de la lección',
    required: false 
  })
  @Column({ type: 'timestamp', nullable: true })
  fecha_completado: Date;

  @ApiProperty({ 
    description: 'Tiempo total en minutos',
    required: false 
  })
  @Column({ type: 'int', nullable: true })
  tiempo_total_minutos: number;

  @ApiProperty({ 
    description: 'Notas o comentarios del estudiante',
    required: false 
  })
  @Column({ type: 'text', nullable: true })
  notas: string;
}
