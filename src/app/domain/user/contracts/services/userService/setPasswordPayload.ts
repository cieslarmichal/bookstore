import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface SetPasswordPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly userId: string;
  readonly password: string;
}
