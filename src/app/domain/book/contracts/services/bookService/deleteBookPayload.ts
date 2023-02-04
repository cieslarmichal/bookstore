import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface DeleteBookPayload {
  readonly unitOfWork: UnitOfWork;
  readonly bookId: string;
}
