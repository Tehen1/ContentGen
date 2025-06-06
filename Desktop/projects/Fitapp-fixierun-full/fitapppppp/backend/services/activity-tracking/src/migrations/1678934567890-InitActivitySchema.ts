import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitActivitySchema1678934567890 implements MigrationInterface {
  name = 'InitActivitySchema1678934567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "activity" (
        "id" SERIAL PRIMARY KEY,
        "userId" VARCHAR NOT NULL,
        "type" VARCHAR NOT NULL,
        "duration" INT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "activity"`);
  }
}
