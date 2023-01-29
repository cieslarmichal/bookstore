import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface DeleteAuthorBookPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly authorId: string;
  readonly bookId: string;
}
