import { Filter } from '../../../../../common/filter/filter';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { PaginationData } from '../../../../common/paginationData';

export interface FindAuthorsPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly filters: Filter[];
  readonly pagination: PaginationData;
}
