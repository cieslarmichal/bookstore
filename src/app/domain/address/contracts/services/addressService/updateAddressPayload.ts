import { UpdateAddressDraft } from './updateAddressDraft';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface UpdateAddressPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly addressId: string;
  readonly draft: UpdateAddressDraft;
}
