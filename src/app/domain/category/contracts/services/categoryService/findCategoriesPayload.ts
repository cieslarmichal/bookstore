import { Filter } from '../../../../../common/types/contracts/filter';
import { PaginationData } from '../../../../../common/types/contracts/paginationData';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface FindCategoriesPayload {
  readonly unitOfWork: UnitOfWork;
  readonly filters: Filter[];
  readonly pagination: PaginationData;
}
