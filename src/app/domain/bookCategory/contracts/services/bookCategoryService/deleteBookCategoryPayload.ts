import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface DeleteBookCategoryPayload {
  readonly unitOfWork: UnitOfWork;
  readonly categoryId: string;
  readonly bookId: string;
}
