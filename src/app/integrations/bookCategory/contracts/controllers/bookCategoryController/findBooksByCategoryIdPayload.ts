import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../common/pagination/paginationData';

export interface FindBooksByCategoryIdPayload {
  readonly filters: Filter[];
  readonly pagination: PaginationData;
  readonly categoryId: string;
}
