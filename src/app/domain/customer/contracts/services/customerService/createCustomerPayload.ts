import { CreateCustomerDraft } from './createCustomerDraft';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface CreateCustomerPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly draft: CreateCustomerDraft;
}
