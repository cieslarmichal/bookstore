import { Filter } from '../../../../../common/types/contracts/filter';
import { PaginationData } from '../../../../../common/types/contracts/paginationData';

export interface FindBooksByAuthorIdPayload {
  readonly filters: Filter[];
  readonly pagination: PaginationData;
  readonly authorId: string;
}
