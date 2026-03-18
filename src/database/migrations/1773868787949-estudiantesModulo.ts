import { MigrationInterface, QueryRunner } from "typeorm";

export class EstudiantesModulo1773868787949 implements MigrationInterface {
    name = 'EstudiantesModulo1773868787949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "estudiante" ("id" SERIAL NOT NULL, "fechanacimiento" character varying NOT NULL, "edad" integer NOT NULL, "fecharegistro" character varying, "userId" integer, CONSTRAINT "REL_4118487d9679172ccb9da29aa5" UNIQUE ("userId"), CONSTRAINT "PK_c7507c4641e36b102952aefc33b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "estudiante" ADD CONSTRAINT "FK_4118487d9679172ccb9da29aa5a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "estudiante" DROP CONSTRAINT "FK_4118487d9679172ccb9da29aa5a"`);
        await queryRunner.query(`DROP TABLE "estudiante"`);
    }

}
