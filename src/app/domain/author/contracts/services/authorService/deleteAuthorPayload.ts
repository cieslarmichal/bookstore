import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface DeleteAuthorPayload {
  readonly unitOfWork: UnitOfWork;
  readonly authorId: string;
}
