import { Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToOne, 
    JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Docente {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ultimoAcceso: string;

  @Column()
  pagos: number;

  @OneToOne(() => User, (user) => user.docente)
  @JoinColumn() // 🔥 aquí se crea la FK
  user: User;
}