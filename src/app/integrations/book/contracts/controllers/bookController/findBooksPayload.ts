import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../../common/pagination/paginationData';

export interface FindBooksPayload {
  readonly filters: Filter[];
  readonly pagination: PaginationData;
}
