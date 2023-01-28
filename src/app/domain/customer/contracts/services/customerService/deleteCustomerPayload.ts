import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface DeleteCustomerPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly customerId: string;
}
