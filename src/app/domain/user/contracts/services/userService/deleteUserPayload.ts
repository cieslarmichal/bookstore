import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface DeleteUserPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly userId: string;
}
