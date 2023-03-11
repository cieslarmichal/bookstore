import { CreateOnePayload } from './payloads/createOnePayload';
import { DeleteOnePayload } from './payloads/deleteOnePayload';
import { FindManyPayload } from './payloads/findManyPayload';
import { FindOnePayload } from './payloads/findOnePayload';
import { UpdateOnePayload } from './payloads/updateOnePayload';
import { LineItem } from '../../../domain/entities/lineItem/lineItem';

export interface LineItemRepository {
  createOne(input: CreateOnePayload): Promise<LineItem>;
  findOne(input: FindOnePayload): Promise<LineItem | null>;
  findMany(input: FindManyPayload): Promise<LineItem[]>;
  updateOne(input: UpdateOnePayload): Promise<LineItem>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
