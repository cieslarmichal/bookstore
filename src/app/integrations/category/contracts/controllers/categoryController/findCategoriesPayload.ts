import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../../common/pagination/paginationData';

export interface FindCategoriesPayload {
  readonly filters: Filter[];
  readonly pagination: PaginationData;
}
