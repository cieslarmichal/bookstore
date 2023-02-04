import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface DeleteCategoryPayload {
  readonly unitOfWork: UnitOfWork;
  readonly categoryId: string;
}
