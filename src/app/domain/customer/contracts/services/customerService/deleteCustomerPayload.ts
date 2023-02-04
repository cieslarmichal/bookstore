import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface DeleteCustomerPayload {
  readonly unitOfWork: UnitOfWork;
  readonly customerId: string;
}
