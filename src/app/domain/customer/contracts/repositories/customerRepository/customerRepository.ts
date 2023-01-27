import { CreateOnePayload } from './createOnePayload';
import { DeleteOnePayload } from './deleteOnePayload';
import { FindOnePayload } from './findOnePayload';
import { Customer } from '../../customer';

export interface CustomerRepository {
  createOne(input: CreateOnePayload): Promise<Customer>;
  findOne(input: FindOnePayload): Promise<Customer | null>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
