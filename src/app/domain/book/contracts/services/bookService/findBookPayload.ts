import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface FindBookPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly bookId: string;
}
