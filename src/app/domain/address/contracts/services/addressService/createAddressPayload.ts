import { CreateAddressDraft } from './createAddressDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface CreateAddressPayload {
  readonly unitOfWork: UnitOfWork;
  readonly draft: CreateAddressDraft;
}
