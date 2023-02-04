import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface DeleteAddressPayload {
  readonly unitOfWork: UnitOfWork;
  readonly addressId: string;
}
