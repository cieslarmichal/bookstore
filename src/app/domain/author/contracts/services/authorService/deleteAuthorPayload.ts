import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface DeleteAuthorPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly authorId: string;
}
