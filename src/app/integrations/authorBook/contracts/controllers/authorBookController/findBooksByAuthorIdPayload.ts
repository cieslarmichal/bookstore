import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../../common/pagination/paginationData';

export interface FindBooksByAuthorIdPayload {
  readonly filters: Filter[];
  readonly pagination: PaginationData;
  readonly authorId: string;
}
