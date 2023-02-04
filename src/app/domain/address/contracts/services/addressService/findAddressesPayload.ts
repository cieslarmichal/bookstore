import { Filter } from '../../../../../common/filter/filter';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { PaginationData } from '../../../../common/paginationData';

export interface FindAddressesPayload {
  readonly unitOfWork: UnitOfWork;
  readonly filters: Filter[];
  readonly pagination: PaginationData;
}
