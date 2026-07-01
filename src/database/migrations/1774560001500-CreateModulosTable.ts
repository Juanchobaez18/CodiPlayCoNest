import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateModulosTable1774560001500 implements MigrationInterface {
  name = 'CreateModulosTable1774560001500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'modulos',
        columns: [
          {
            name: 'id',
            type: 'SERIAL',
            isPrimary: true,
          },
          {
            name: 'titulo',
            type: 'character varying',
            isNullable: false,
          },
          {
            name: 'descripcion',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'orden',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'completado',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'fechacompletado',
            type: 'character varying',
            isNullable: true,
          },
          {
            name: 'cursoId',
            type: 'integer',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'modulos',
      new TableForeignKey({
        columnNames: ['cursoId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'curso',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('modulos');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.includes('cursoId'));
    if (foreignKey) {
      await queryRunner.dropForeignKey('modulos', foreignKey);
    }
    await queryRunner.dropTable('modulos', true);
  }
}
