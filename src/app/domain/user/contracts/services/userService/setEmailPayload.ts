import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface SetEmailPayload {
  readonly unitOfWork: UnitOfWork;
  readonly userId: string;
  readonly email: string;
}
