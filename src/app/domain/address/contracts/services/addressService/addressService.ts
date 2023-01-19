import { Filter } from '../../../../../common/filter/filter';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { PaginationData } from '../../../../common/paginationData';
import { Address } from '../../address';
import { CreateAddressData } from './createAddressData';

export interface AddressService {
  createAddress(unitOfWork: PostgresUnitOfWork, addressData: CreateAddressData): Promise<Address>;
  findAddress(unitOfWork: PostgresUnitOfWork, addressId: string): Promise<Address>;
  findAddresses(unitOfWork: PostgresUnitOfWork, filters: Filter[], paginationData: PaginationData): Promise<Address[]>;
  removeAddress(unitOfWork: PostgresUnitOfWork, addressId: string): Promise<void>;
}
