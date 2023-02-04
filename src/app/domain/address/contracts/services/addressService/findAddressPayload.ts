import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface FindAddressPayload {
  readonly unitOfWork: UnitOfWork;
  readonly addressId: string;
}
