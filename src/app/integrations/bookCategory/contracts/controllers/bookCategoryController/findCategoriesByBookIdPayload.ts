import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../common/pagination/paginationData';

export interface FindCategoriesByBookIdPayload {
  readonly filters: Filter[];
  readonly pagination: PaginationData;
  readonly bookId: string;
}
