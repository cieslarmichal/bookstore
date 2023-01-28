import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface DeleteBookPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly bookId: string;
}
