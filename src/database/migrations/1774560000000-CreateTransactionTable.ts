import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateTransactionTable1774560000000 implements MigrationInterface {
  name = 'CreateTransactionTable1774560000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'SERIAL',
            isPrimary: true,
          },
          {
            name: 'estudianteId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'cursoId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'completed', 'failed'],
            default: "'pending'",
            isNullable: false,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'TIMESTAMP',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'TIMESTAMP',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Foreign Key para estudiante
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['estudianteId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'estudiante',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Foreign Key para curso
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['cursoId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'curso',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Crear índices
    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        columnNames: ['estudianteId', 'createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.dropIndex('transactions', 'idx_transactions_status');
    await queryRunner.dropIndex('transactions', 'idx_transactions_estudianteId_createdAt');

    // Eliminar Foreign Keys
    await queryRunner.dropForeignKey('transactions', 'FK_transactions_cursoId');
    await queryRunner.dropForeignKey('transactions', 'FK_transactions_estudianteId');

    // Eliminar tabla
    await queryRunner.dropTable('transactions', true);
  }
}
