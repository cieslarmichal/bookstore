import { FindConditions } from 'typeorm';

import { Customer } from '../../customer';
import { CustomerEntity } from '../../customerEntity';

export interface CustomerRepository {
  createOne(customerData: Partial<CustomerEntity>): Promise<Customer>;
  findOne(conditions: FindConditions<CustomerEntity>): Promise<Customer | null>;
  findOneById(id: string): Promise<Customer | null>;
  findMany(conditions: FindConditions<CustomerEntity>): Promise<Customer[]>;
  updateOne(id: string, customerData: Partial<CustomerEntity>): Promise<Customer>;
  removeOne(id: string): Promise<void>;
}
