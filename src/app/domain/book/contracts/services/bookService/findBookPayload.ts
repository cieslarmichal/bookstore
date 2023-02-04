import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface FindBookPayload {
  readonly unitOfWork: UnitOfWork;
  readonly bookId: string;
}
