import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../../common/pagination/paginationData';

export interface FindManyPayload {
  readonly filters: Filter[];
  readonly pagination: PaginationData;
}
