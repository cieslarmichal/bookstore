import { EntityManager } from 'typeorm';

import { TransactionCallback } from './transactionCallback';

export interface UnitOfWork {
  init(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  cleanUp(): Promise<void>;
  runInTransaction<Result>(callback: TransactionCallback<Result, UnitOfWork>): Promise<Result>;
  getEntityManager(): EntityManager;
}
