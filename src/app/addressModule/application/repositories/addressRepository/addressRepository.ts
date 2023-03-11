import { CreateOnePayload } from './payloads/createOnePayload';
import { DeleteOnePayload } from './payloads/deleteOnePayload';
import { FindManyPayload } from './payloads/findManyPayload';
import { FindOnePayload } from './payloads/findOnePayload';
import { UpdateOnePayload } from './payloads/updateOnePayload';
import { Address } from '../../../domain/entities/address/address';

export interface AddressRepository {
  createOne(input: CreateOnePayload): Promise<Address>;
  findOne(input: FindOnePayload): Promise<Address | null>;
  findMany(input: FindManyPayload): Promise<Address[]>;
  updateOne(input: UpdateOnePayload): Promise<Address>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
