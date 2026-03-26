import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentsModule1774560001000 implements MigrationInterface {
  name = 'AddPaymentsModule1774560001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insertar módulo 'payments' si no existe
    await queryRunner.query(`
      INSERT INTO "modules" (name, description)
      VALUES ('payments', 'Gestión de pagos y transacciones')
      ON CONFLICT (name) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar el módulo 'payments'
    await queryRunner.query(`
      DELETE FROM "modules" WHERE name = 'payments'
    `);
  }
}
