import { Filter } from '../../../../../common/types/contracts/filter';
import { PaginationData } from '../../../../../common/types/contracts/paginationData';

export interface FindAuthorsPayload {
  readonly filters: Filter[];
  readonly pagination: PaginationData;
}
