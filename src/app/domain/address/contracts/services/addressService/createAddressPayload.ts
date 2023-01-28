import { CreateAddressDraft } from './createAddressDraft';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface CreateAddressPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly draft: CreateAddressDraft;
}
