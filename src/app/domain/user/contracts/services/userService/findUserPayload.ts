import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface FindUserPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly userId: string;
}
