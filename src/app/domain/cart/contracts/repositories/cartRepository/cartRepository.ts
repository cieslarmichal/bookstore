import { CreateOnePayload } from './createOnePayload';
import { DeleteOnePayload } from './deleteOnePayload';
import { FindOnePayload } from './findOnePayload';
import { UpdateOnePayload } from './updateOnePayload';
import { Cart } from '../../cart';

export interface CartRepository {
  createOne(input: CreateOnePayload): Promise<Cart>;
  findOne(input: FindOnePayload): Promise<Cart | null>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
  updateOne(input: UpdateOnePayload): Promise<Cart>;
}
