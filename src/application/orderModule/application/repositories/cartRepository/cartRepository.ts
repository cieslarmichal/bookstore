import { CreateOnePayload } from './payloads/createOnePayload';
import { DeleteOnePayload } from './payloads/deleteOnePayload';
import { FindOnePayload } from './payloads/findOnePayload';
import { UpdateOnePayload } from './payloads/updateOnePayload';
import { Cart } from '../../../domain/entities/cart/cart';

export interface CartRepository {
  createOne(input: CreateOnePayload): Promise<Cart>;
  findOne(input: FindOnePayload): Promise<Cart | null>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
  updateOne(input: UpdateOnePayload): Promise<Cart>;
}
