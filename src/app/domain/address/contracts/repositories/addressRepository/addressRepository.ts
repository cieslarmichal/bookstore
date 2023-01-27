import { CreateOnePayload } from './createOnePayload';
import { DeleteOnePayload } from './deleteOnePayload';
import { FindManyPayload } from './findManyPayload';
import { FindOnePayload } from './findOnePayload';
import { UpdateOnePayload } from './updateOnePayload';
import { Address } from '../../address';

export interface AddressRepository {
  createOne(input: CreateOnePayload): Promise<Address>;
  findOne(input: FindOnePayload): Promise<Address | null>;
  findMany(input: FindManyPayload): Promise<Address[]>;
  updateOne(input: UpdateOnePayload): Promise<Address>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
