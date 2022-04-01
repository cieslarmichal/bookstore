import { AwilixContainer } from 'awilix';
import { PostgresUnitOfWork, TransactionCallback, UNIT_OF_WORK_FACTORY } from '../../../app/shared';
import { dbManager } from '../../../app/shared';

export class PostgresHelper {
  public constructor(private readonly container: AwilixContainer) {}

  public static async removeDataFromTables(): Promise<void> {
    const connection = await dbManager.getConnection();

    const entities = connection.entityMetadatas;

    for (const entity of entities) {
      await connection.getRepository(entity.name).delete({});
    }
  }

  public async runInTestTransaction<Result>(callback: TransactionCallback<Result, PostgresUnitOfWork>): Promise<void> {
    const unitOfWorkFactory = this.container.resolve(UNIT_OF_WORK_FACTORY);

    const unitOfWork = await unitOfWorkFactory.create();

    jest.spyOn(unitOfWork, 'commit').mockImplementation(async () => {
      await unitOfWork.rollback();
    });

    await unitOfWork.runInTransaction(async () => {
      return callback(unitOfWork);
    });
  }
}
