import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface SetEmailPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly userId: string;
  readonly email: string;
}
