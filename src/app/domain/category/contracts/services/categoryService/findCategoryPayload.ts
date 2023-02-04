import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface FindCategoryPayload {
  readonly unitOfWork: UnitOfWork;
  readonly categoryId: string;
}
