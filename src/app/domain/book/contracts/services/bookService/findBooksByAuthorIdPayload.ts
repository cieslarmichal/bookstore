import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../../common/pagination/paginationData';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface FindBooksByAuthorIdPayload {
  readonly unitOfWork: UnitOfWork;
  readonly filters: Filter[];
  readonly pagination: PaginationData;
  readonly authorId: string;
}
