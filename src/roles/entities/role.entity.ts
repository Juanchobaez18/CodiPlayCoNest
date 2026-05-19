import { ModuleEntity } from '../../modules/entities/module.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { User } from '../../users/entities/user.entity';
import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    name;

    @Column({ type: 'varchar', length: 255 })
    description;

    @ManyToMany(() => User, user => user.roles)
    users: User[];

  @ManyToMany(() => ModuleEntity, { eager: true })
  @JoinTable({
      name: 'role_modules',
      joinColumn: { name: 'role_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'module_id', referencedColumnName: 'id' }
  })
  modules: ModuleEntity[];

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
      name: 'role_permissions',
      joinColumn: { name: 'role_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' }
  })
  permissions: Permission[];
}
