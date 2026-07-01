import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCursoTable1774559999995 implements MigrationInterface {
  name = 'CreateCursoTable1774559999995';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'curso',
        columns: [
          {
            name: 'id',
            type: 'SERIAL',
            isPrimary: true,
          },
          {
            name: 'nombre',
            type: 'character varying',
            isNullable: false,
          },
          {
            name: 'descripcion',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'dificultad',
            type: 'character varying',
            isNullable: false,
          },
          {
            name: 'precio',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'estado',
            type: 'boolean',
            isNullable: false,
            default: 'true',
          },
          {
            name: 'docente_id',
            type: 'integer',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'curso',
      new TableForeignKey({
        columnNames: ['docente_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'docente',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('curso');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.includes('docente_id'));
    if (foreignKey) {
      await queryRunner.dropForeignKey('curso', foreignKey);
    }
    await queryRunner.dropTable('curso', true);
  }
}
