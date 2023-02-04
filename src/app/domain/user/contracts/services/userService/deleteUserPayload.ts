import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface DeleteUserPayload {
  readonly unitOfWork: UnitOfWork;
  readonly userId: string;
}
