import { FindConditions } from 'typeorm';

import { Customer } from '../../customer';
import { CustomerEntity } from '../../customerEntity';

export interface CustomerRepository {
  createOne(entity: Partial<CustomerEntity>): Promise<Customer>;
  findOne(conditions: FindConditions<CustomerEntity>): Promise<Customer | null>;
  findOneById(id: string): Promise<Customer | null>;
  findMany(conditions: FindConditions<CustomerEntity>): Promise<Customer[]>;
  updateOne(id: string, customerData: Partial<CustomerEntity>): Promise<Customer>;
  deleteOne(id: string): Promise<void>;
}
