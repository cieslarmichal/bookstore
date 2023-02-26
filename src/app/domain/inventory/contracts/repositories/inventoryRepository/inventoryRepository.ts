import { CreateOnePayload } from './createOnePayload';
import { DeleteOnePayload } from './deleteOnePayload';
import { FindManyPayload } from './findManyPayload';
import { FindOnePayload } from './findOnePayload';
import { UpdateOnePayload } from './updateOnePayload';
import { Inventory } from '../../inventory';

export interface InventoryRepository {
  createOne(input: CreateOnePayload): Promise<Inventory>;
  findOne(input: FindOnePayload): Promise<Inventory | null>;
  findMany(input: FindManyPayload): Promise<Inventory[]>;
  updateOne(input: UpdateOnePayload): Promise<Inventory>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
