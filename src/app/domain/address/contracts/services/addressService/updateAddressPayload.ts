import { UpdateAddressDraft } from './updateAddressDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface UpdateAddressPayload {
  readonly unitOfWork: UnitOfWork;
  readonly addressId: string;
  readonly draft: UpdateAddressDraft;
}
