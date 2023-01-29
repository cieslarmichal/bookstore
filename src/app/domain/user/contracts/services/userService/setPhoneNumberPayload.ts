import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface SetPhoneNumberPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly userId: string;
  readonly phoneNumber: string;
}
