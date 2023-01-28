import { CreateCustomerPayload } from './createCustomerPayload';
import { DeleteCustomerPayload } from './deleteCustomerPayload';
import { FindCustomerPayload } from './findCustomerPayload';
import { Customer } from '../../customer';

export interface CustomerService {
  createCustomer(input: CreateCustomerPayload): Promise<Customer>;
  findCustomer(input: FindCustomerPayload): Promise<Customer>;
  deleteCustomer(input: DeleteCustomerPayload): Promise<void>;
}
