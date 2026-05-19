import { Role } from 'src/roles/entities/role.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';

@Entity('modules')
export class ModuleEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Role, role => role.modules)
  roles: Role[];

  @OneToMany(() => Permission, permission => permission.module)
  permissions: Permission[];
}