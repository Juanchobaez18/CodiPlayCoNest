import { Module } from '@nestjs/common';
import { RolesService } from './services/roles.service';
import { RolesController } from './controllers/roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { ModulesModule } from '../modules/modules.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), ModulesModule],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService, TypeOrmModule]
})
export class RolesModule {}
