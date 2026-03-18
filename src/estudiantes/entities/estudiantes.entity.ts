import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

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
}