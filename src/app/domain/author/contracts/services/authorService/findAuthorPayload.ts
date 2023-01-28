import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface FindAuthorPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly authorId: string;
}
