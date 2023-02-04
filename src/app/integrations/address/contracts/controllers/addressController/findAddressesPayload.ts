import { Filter } from '../../../../../common/types/contracts/filter';
import { PaginationData } from '../../../../../common/types/contracts/paginationData';

export interface FindAddressesPayload {
  readonly filters: Filter[];
  readonly pagination: PaginationData;
}
