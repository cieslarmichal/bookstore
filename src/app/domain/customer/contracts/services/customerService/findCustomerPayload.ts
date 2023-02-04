import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface FindCustomerPayload {
  readonly unitOfWork: UnitOfWork;
  readonly customerId?: string;
  readonly userId?: string;
}
