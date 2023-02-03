import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../common/pagination/paginationData';

export interface FindAuthorsByBookIdPayload {
  readonly filters: Filter[];
  readonly pagination: PaginationData;
  readonly bookId: string;
}
