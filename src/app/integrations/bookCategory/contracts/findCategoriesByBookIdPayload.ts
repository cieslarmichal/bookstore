import { Filter } from '../../../../../common/types/contracts/filter';
import { PaginationData } from '../../../../../common/types/contracts/paginationData';

export interface FindCategoriesByBookIdPayload {
  readonly filters: Filter[];
  readonly pagination: PaginationData;
  readonly bookId: string;
}
