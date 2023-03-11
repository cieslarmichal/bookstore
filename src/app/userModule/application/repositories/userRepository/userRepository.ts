import { CreateOnePayload } from './payloads/createOnePayload';
import { DeleteOnePayload } from './payloads/deleteOnePayload';
import { FindOnePayload } from './payloads/findOnePayload';
import { UpdateOnePayload } from './payloads/updateOnePayload';
import { User } from '../../../domain/entities/user/user';

export interface UserRepository {
  createOne(input: CreateOnePayload): Promise<User>;
  findOne(input: FindOnePayload): Promise<User | null>;
  updateOne(input: UpdateOnePayload): Promise<User>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
