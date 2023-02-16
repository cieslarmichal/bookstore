import { CreateOnePayload } from './createOnePayload';
import { DeleteOnePayload } from './deleteOnePayload';
import { FindManyPayload } from './findManyPayload';
import { FindOnePayload } from './findOnePayload';
import { UpdateOnePayload } from './updateOnePayload';
import { LineItem } from '../../lineItem';

export interface LineItemRepository {
  createOne(input: CreateOnePayload): Promise<LineItem>;
  findOne(input: FindOnePayload): Promise<LineItem | null>;
  findMany(input: FindManyPayload): Promise<LineItem[]>;
  updateOne(input: UpdateOnePayload): Promise<LineItem>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
