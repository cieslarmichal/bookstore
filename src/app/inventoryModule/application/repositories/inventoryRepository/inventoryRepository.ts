import { CreateOnePayload } from './payloads/createOnePayload';
import { DeleteOnePayload } from './payloads/deleteOnePayload';
import { FindManyPayload } from './payloads/findManyPayload';
import { FindOnePayload } from './payloads/findOnePayload';
import { UpdateOnePayload } from './payloads/updateOnePayload';
import { Inventory } from '../../../domain/entities/inventory/inventory';

export interface InventoryRepository {
  createOne(input: CreateOnePayload): Promise<Inventory>;
  findOne(input: FindOnePayload): Promise<Inventory | null>;
  findMany(input: FindManyPayload): Promise<Inventory[]>;
  updateOne(input: UpdateOnePayload): Promise<Inventory>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
