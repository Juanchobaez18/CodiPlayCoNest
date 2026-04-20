import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1776203802925 implements MigrationInterface {
    name = 'InitialMigration1776203802925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "modules" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_8cd1abde4b70e59644c98668c06" UNIQUE ("name"), CONSTRAINT "PK_7dbefd488bd96c5bf31f0ce0c95" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" character varying(255) NOT NULL, CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "estudiante" ("id" SERIAL NOT NULL, "fechanacimiento" character varying NOT NULL, "edad" integer NOT NULL, "fecharegistro" character varying, "userId" integer, CONSTRAINT "REL_4118487d9679172ccb9da29aa5" UNIQUE ("userId"), CONSTRAINT "PK_c7507c4641e36b102952aefc33b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_status_enum" AS ENUM('pending', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "estudianteId" integer NOT NULL, "cursoId" integer NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'USD', "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'pending', "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_da87c55b3bbbe96c6ed88ea7ee" ON "transactions" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_94311cfa9d45a6b8679940e188" ON "transactions" ("estudianteId", "createdAt") `);
        await queryRunner.query(`CREATE TABLE "lecciones" ("id" SERIAL NOT NULL, "titulo" character varying NOT NULL, "descripcion" character varying NOT NULL, "contenido" character varying NOT NULL, "orden" character varying NOT NULL, "moduloId" integer, CONSTRAINT "PK_8a02592ff90fd07b15c427390e0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "modulos" ("id" SERIAL NOT NULL, "titulo" character varying NOT NULL, "descripcion" text NOT NULL, "orden" integer NOT NULL, "completado" boolean NOT NULL DEFAULT false, "fechacompletado" character varying, "cursoId" integer, CONSTRAINT "PK_ba8d97b7acc232a928b1d686c5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "curso" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "descripcion" text NOT NULL, "dificultad" character varying NOT NULL, "precio" numeric NOT NULL, "estado" boolean NOT NULL DEFAULT true, "docente_id" integer, CONSTRAINT "PK_76073a915621326fb85f28ecc5d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "docente" ("id" SERIAL NOT NULL, "ultimoAcceso" character varying NOT NULL, "pagos" integer NOT NULL, "userId" integer, CONSTRAINT "REL_22478673b14405ef4bcfda74a1" UNIQUE ("userId"), CONSTRAINT "PK_badad2b3623effea5d5d5b244c4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "docType" character varying(255) NOT NULL, "docNumber" character varying(255) NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "avatar" character varying(255) NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role_modules" ("role_id" integer NOT NULL, "module_id" integer NOT NULL, CONSTRAINT "PK_0898417a9cc2d78e322076dc86a" PRIMARY KEY ("role_id", "module_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d94c957204d1c78e702a97cc1a" ON "role_modules" ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_037d3081ebb1e33fa2b4204e05" ON "role_modules" ("module_id") `);
        await queryRunner.query(`CREATE TABLE "curso_estudiantes" ("curso_id" integer NOT NULL, "estudiante_id" integer NOT NULL, CONSTRAINT "PK_ed2119d56cbdf491d8ef8cf9582" PRIMARY KEY ("curso_id", "estudiante_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7035bb1ccfe7ac903f01864da9" ON "curso_estudiantes" ("curso_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_41e5c2d052bbd544b9e78729ae" ON "curso_estudiantes" ("estudiante_id") `);
        await queryRunner.query(`CREATE TABLE "user_roles" ("userId" integer NOT NULL, "roleId" integer NOT NULL, CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475" PRIMARY KEY ("userId", "roleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_472b25323af01488f1f66a06b6" ON "user_roles" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_86033897c009fcca8b6505d6be" ON "user_roles" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "estudiante" ADD CONSTRAINT "FK_4118487d9679172ccb9da29aa5a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_2aeaf8d7f6bb6af4df49ba8a55b" FOREIGN KEY ("estudianteId") REFERENCES "estudiante"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_799f90acd2dc5afcaa225c7f107" FOREIGN KEY ("cursoId") REFERENCES "curso"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lecciones" ADD CONSTRAINT "FK_4ced15fb977c809a2321da76faf" FOREIGN KEY ("moduloId") REFERENCES "modulos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "modulos" ADD CONSTRAINT "FK_a373365e6bc2320fd6860aa7422" FOREIGN KEY ("cursoId") REFERENCES "curso"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "curso" ADD CONSTRAINT "FK_d3052491ab3caa576de04a56dbc" FOREIGN KEY ("docente_id") REFERENCES "docente"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "docente" ADD CONSTRAINT "FK_22478673b14405ef4bcfda74a1b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_modules" ADD CONSTRAINT "FK_d94c957204d1c78e702a97cc1a9" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_modules" ADD CONSTRAINT "FK_037d3081ebb1e33fa2b4204e057" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "curso_estudiantes" ADD CONSTRAINT "FK_7035bb1ccfe7ac903f01864da9a" FOREIGN KEY ("curso_id") REFERENCES "curso"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "curso_estudiantes" ADD CONSTRAINT "FK_41e5c2d052bbd544b9e78729ae6" FOREIGN KEY ("estudiante_id") REFERENCES "estudiante"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_86033897c009fcca8b6505d6be2" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_86033897c009fcca8b6505d6be2"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_472b25323af01488f1f66a06b67"`);
        await queryRunner.query(`ALTER TABLE "curso_estudiantes" DROP CONSTRAINT "FK_41e5c2d052bbd544b9e78729ae6"`);
        await queryRunner.query(`ALTER TABLE "curso_estudiantes" DROP CONSTRAINT "FK_7035bb1ccfe7ac903f01864da9a"`);
        await queryRunner.query(`ALTER TABLE "role_modules" DROP CONSTRAINT "FK_037d3081ebb1e33fa2b4204e057"`);
        await queryRunner.query(`ALTER TABLE "role_modules" DROP CONSTRAINT "FK_d94c957204d1c78e702a97cc1a9"`);
        await queryRunner.query(`ALTER TABLE "docente" DROP CONSTRAINT "FK_22478673b14405ef4bcfda74a1b"`);
        await queryRunner.query(`ALTER TABLE "curso" DROP CONSTRAINT "FK_d3052491ab3caa576de04a56dbc"`);
        await queryRunner.query(`ALTER TABLE "modulos" DROP CONSTRAINT "FK_a373365e6bc2320fd6860aa7422"`);
        await queryRunner.query(`ALTER TABLE "lecciones" DROP CONSTRAINT "FK_4ced15fb977c809a2321da76faf"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_799f90acd2dc5afcaa225c7f107"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_2aeaf8d7f6bb6af4df49ba8a55b"`);
        await queryRunner.query(`ALTER TABLE "estudiante" DROP CONSTRAINT "FK_4118487d9679172ccb9da29aa5a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_86033897c009fcca8b6505d6be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_472b25323af01488f1f66a06b6"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_41e5c2d052bbd544b9e78729ae"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7035bb1ccfe7ac903f01864da9"`);
        await queryRunner.query(`DROP TABLE "curso_estudiantes"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_037d3081ebb1e33fa2b4204e05"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d94c957204d1c78e702a97cc1a"`);
        await queryRunner.query(`DROP TABLE "role_modules"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "docente"`);
        await queryRunner.query(`DROP TABLE "curso"`);
        await queryRunner.query(`DROP TABLE "modulos"`);
        await queryRunner.query(`DROP TABLE "lecciones"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_94311cfa9d45a6b8679940e188"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_da87c55b3bbbe96c6ed88ea7ee"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
        await queryRunner.query(`DROP TABLE "estudiante"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TABLE "modules"`);
    }

}
