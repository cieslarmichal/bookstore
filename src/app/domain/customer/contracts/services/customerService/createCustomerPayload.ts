import { CreateCustomerDraft } from './createCustomerDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface CreateCustomerPayload {
  readonly unitOfWork: UnitOfWork;
  readonly draft: CreateCustomerDraft;
}
