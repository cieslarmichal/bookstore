import { CreateCustomerData } from './createCustomerData';
import { FindCustomerData } from './findCustomerData';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { Customer } from '../../customer';

export interface CustomerService {
  createCustomer(unitOfWork: PostgresUnitOfWork, customerData: CreateCustomerData): Promise<Customer>;
  findCustomer(unitOfWork: PostgresUnitOfWork, customerData: FindCustomerData): Promise<Customer>;
  removeCustomer(unitOfWork: PostgresUnitOfWork, customerId: string): Promise<void>;
}
