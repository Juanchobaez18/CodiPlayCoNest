import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/roles/roles.module';
import { DocenteModule } from 'src/docente/docente.module';
import { CursoModule } from 'src/curso/curso.module';
import { EstudiantesModule } from 'src/estudiantes/estudiantes.module';
import { AdminPanelGuard } from 'src/auth/guards/admin-panel.guard';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminMailService } from './admin-mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
    UsersModule,
    RolesModule,
    DocenteModule,
    CursoModule,
    EstudiantesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminMailService, AdminPanelGuard],
})
export class AdminModule {}
