import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface FindUserPayload {
  readonly unitOfWork: UnitOfWork;
  readonly userId: string;
}
