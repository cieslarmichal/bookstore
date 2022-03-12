import { dbManager } from '../../../app/shared';

export class PostgresHelper {
  public static async removeDataFromTables(): Promise<void> {
    const connection = await dbManager.getConnection();

    const entities = connection.entityMetadatas;

    for (const entity of entities) {
      await connection.getRepository(entity.name).delete({});
    }
  }
}
