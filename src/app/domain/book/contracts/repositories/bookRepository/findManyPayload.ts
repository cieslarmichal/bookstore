import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../common/paginationData';

export interface FindManyPayload {
  readonly filters: Filter[];
  readonly paginationData: PaginationData;
  readonly authorId?: string;
  readonly categoryId?: string;
}
