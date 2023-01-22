import { FindConditions } from 'typeorm';

import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../common/paginationData';
import { Address } from '../../address';
import { AddressEntity } from '../../addressEntity';

export interface AddressRepository {
  createOne(addressData: Partial<AddressEntity>): Promise<Address>;
  findOne(conditions: FindConditions<AddressEntity>): Promise<Address | null>;
  findOneById(id: string): Promise<Address | null>;
  findMany(filters: Filter[], paginationData: PaginationData): Promise<Address[]>;
  updateOne(id: string, addressData: Partial<AddressEntity>): Promise<Address>;
  removeOne(id: string): Promise<void>;
}
