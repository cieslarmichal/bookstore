import { CreateOnePayload } from './payloads/createOnePayload';
import { DeleteOnePayload } from './payloads/deleteOnePayload';
import { FindOnePayload } from './payloads/findOnePayload';
import { Customer } from '../../../domain/entities/customer/customer';

export interface CustomerRepository {
  createOne(input: CreateOnePayload): Promise<Customer>;
  findOne(input: FindOnePayload): Promise<Customer | null>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
