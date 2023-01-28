import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface FindCustomerPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly customerId?: string;
  readonly userId?: string;
}
