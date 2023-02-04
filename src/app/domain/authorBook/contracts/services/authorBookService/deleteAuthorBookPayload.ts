import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface DeleteAuthorBookPayload {
  readonly unitOfWork: UnitOfWork;
  readonly authorId: string;
  readonly bookId: string;
}
