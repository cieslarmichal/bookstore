import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface FindAuthorPayload {
  readonly unitOfWork: UnitOfWork;
  readonly authorId: string;
}
