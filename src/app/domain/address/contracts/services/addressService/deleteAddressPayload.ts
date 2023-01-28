import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface DeleteAddressPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly addressId: string;
}
