import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface SetPasswordPayload {
  readonly unitOfWork: UnitOfWork;
  readonly userId: string;
  readonly password: string;
}
