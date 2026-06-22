import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStripeFieldsToTransactions1774560003000 implements MigrationInterface {
  name = 'AddStripeFieldsToTransactions1774560003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'stripePaymentIntentId',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('transactions', 'stripePaymentIntentId');
  }
}
