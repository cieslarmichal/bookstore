import { CreateOnePayload } from './createOnePayload';
import { DeleteOnePayload } from './deleteOnePayload';
import { FindOnePayload } from './findOnePayload';
import { UpdateOnePayload } from './updateOnePayload';
import { User } from '../../user';

export interface UserRepository {
  createOne(input: CreateOnePayload): Promise<User>;
  findOne(input: FindOnePayload): Promise<User | null>;
  updateOne(input: UpdateOnePayload): Promise<User>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
