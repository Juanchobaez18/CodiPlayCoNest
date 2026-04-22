import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Estudiante } from 'src/estudiantes/entities/estudiantes.entity';
import { Docente } from 'src/docente/entities/docente.entity';
import { RemitenteTipo, MensajeEstado } from 'src/mensajes/dto/crear-mensaje.dto'; 

@Entity('mensajes')
export class Mensaje {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  contenido: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_envio: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_lectura: Date;

  @Column({
    type: 'enum',
    enum: MensajeEstado,
    default: MensajeEstado.ENVIADO,
  })
  estado: MensajeEstado;

  @Column({
    type: 'enum',
    enum: RemitenteTipo,
  })
  remitenteTipo: RemitenteTipo;

  @ManyToOne(() => Estudiante, (estudiante) => estudiante.mensajes)
  estudiante: Estudiante;

  @ManyToOne(() => Docente, (docente) => docente.mensajes)
  docente: Docente;

  
}