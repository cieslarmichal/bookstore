import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface SetPhoneNumberPayload {
  readonly unitOfWork: UnitOfWork;
  readonly userId: string;
  readonly phoneNumber: string;
}
