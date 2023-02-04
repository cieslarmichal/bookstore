import { Filter } from '../../../../../common/filter/filter';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { PaginationData } from '../../../../../common/pagination/paginationData';

export interface FindCategoriesByBookIdPayload {
  readonly unitOfWork: UnitOfWork;
  readonly filters: Filter[];
  readonly pagination: PaginationData;
  readonly bookId: string;
}
