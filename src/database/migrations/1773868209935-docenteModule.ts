import { MigrationInterface, QueryRunner } from "typeorm";

export class DocenteModule1773868209935 implements MigrationInterface {
    name = 'DocenteModule1773868209935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "docente" ("id" SERIAL NOT NULL, "ultimoAcceso" character varying NOT NULL, "pagos" integer NOT NULL, "userId" integer, CONSTRAINT "REL_22478673b14405ef4bcfda74a1" UNIQUE ("userId"), CONSTRAINT "PK_badad2b3623effea5d5d5b244c4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "docente" ADD CONSTRAINT "FK_22478673b14405ef4bcfda74a1b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "docente" DROP CONSTRAINT "FK_22478673b14405ef4bcfda74a1b"`);
        await queryRunner.query(`DROP TABLE "docente"`);
    }

}
