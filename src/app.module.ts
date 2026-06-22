import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';

import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { enviroments } from './enviroments';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AuthModule } from './auth/auth.module';
import { ModulesModule } from './modules/modules.module';
import { DocenteModule } from './docente/docente.module';
import { EstudiantesModule } from './estudiantes/estudiantes.module';
import { CursoModule } from './curso/curso.module';
import { ModulosModule } from './modulos/modulos.module';
import { MensajesModule } from './mensajes/mensajes.module';
import config from './config';
import { PaymentsModule } from './payments/payments.module';
import { ForosModule } from './foros/foros.module';
import { ContactModule } from './contact/contact.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        enviroments[process.env.NODE_ENV as keyof typeof enviroments] ||
        enviroments.dev,
      load: [config],
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_HOST: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.number().required(),
        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.number().required(),
        MAIL_USER: Joi.string().required(),
        MAIL_PASS: Joi.string().required(),
        MAIL_FROM: Joi.string().required(),
        MAIL_TO: Joi.string().required(),
        STRIPE_PUBLISHABLE_KEY: Joi.string().required(),
        STRIPE_SECRET_KEY: Joi.string().required(),
        STRIPE_WEBHOOK_SECRET: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    PaymentsModule,
    ModulesModule,
    DocenteModule,
    EstudiantesModule,
    CursoModule,
    ModulosModule,
    ForosModule,
    MensajesModule,
    ContactModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
