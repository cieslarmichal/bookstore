import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface FindAddressPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly addressId: string;
}
