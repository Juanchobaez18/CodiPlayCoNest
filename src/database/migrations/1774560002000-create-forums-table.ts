import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateForumsTable1774560002000 implements MigrationInterface {
    name = 'CreateForumsTable1774560002000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "forum" ("id" SERIAL NOT NULL, "titulo" character varying(255) NOT NULL, "descripcion" text NOT NULL, "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), "docente_id" integer, "modulo_id" integer, CONSTRAINT "PK_3c5c5c5c5c5c5c5c5c5c5c5c5c5c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "forum_estudiantes" ("forum_id" integer NOT NULL, "estudiante_id" integer NOT NULL, CONSTRAINT "PK_forum_estudiantes" PRIMARY KEY ("forum_id", "estudiante_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_forum_docente_id" ON "forum" ("docente_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_forum_modulo_id" ON "forum" ("modulo_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_forum_estudiantes_forum_id" ON "forum_estudiantes" ("forum_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_forum_estudiantes_estudiante_id" ON "forum_estudiantes" ("estudiante_id") `);
        await queryRunner.query(`ALTER TABLE "forum" ADD CONSTRAINT "FK_forum_docente_id" FOREIGN KEY ("docente_id") REFERENCES "docente"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "forum" ADD CONSTRAINT "FK_forum_modulo_id" FOREIGN KEY ("modulo_id") REFERENCES "modulos"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "forum_estudiantes" ADD CONSTRAINT "FK_forum_estudiantes_forum_id" FOREIGN KEY ("forum_id") REFERENCES "forum"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "forum_estudiantes" ADD CONSTRAINT "FK_forum_estudiantes_estudiante_id" FOREIGN KEY ("estudiante_id") REFERENCES "estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "forum_estudiantes" DROP CONSTRAINT "FK_forum_estudiantes_estudiante_id"`);
        await queryRunner.query(`ALTER TABLE "forum_estudiantes" DROP CONSTRAINT "FK_forum_estudiantes_forum_id"`);
        await queryRunner.query(`ALTER TABLE "forum" DROP CONSTRAINT "FK_forum_modulo_id"`);
        await queryRunner.query(`ALTER TABLE "forum" DROP CONSTRAINT "FK_forum_docente_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_forum_estudiantes_estudiante_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_forum_estudiantes_forum_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_forum_modulo_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_forum_docente_id"`);
        await queryRunner.query(`DROP TABLE "forum_estudiantes"`);
        await queryRunner.query(`DROP TABLE "forum"`);
    }

}
