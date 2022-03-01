import { dbManager } from '../../../app/shared';

export class PostgresHelper {
  public static async removeDataFromTables(): Promise<void> {
    const connection = await dbManager.getConnection();

    const entities = connection.entityMetadatas;

    for (const entity of entities) {
      const repository = connection.getRepository(entity.name);
      await repository.query(`TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`);
    }
  }
}
