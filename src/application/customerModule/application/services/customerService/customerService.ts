import { CreateCustomerPayload } from './payloads/createCustomerPayload';
import { DeleteCustomerPayload } from './payloads/deleteCustomerPayload';
import { FindCustomerPayload } from './payloads/findCustomerPayload';
import { Customer } from '../../../domain/entities/customer/customer';

export interface CustomerService {
  createCustomer(input: CreateCustomerPayload): Promise<Customer>;
  findCustomer(input: FindCustomerPayload): Promise<Customer>;
  deleteCustomer(input: DeleteCustomerPayload): Promise<void>;
}
