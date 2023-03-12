import { CreateInventoryPayload } from './payloads/createInventoryPayload';
import { DeleteInventoryPayload } from './payloads/deleteInventoryPayload';
import { FindInventoriesPayload } from './payloads/findInventoriesPayload';
import { FindInventoryPayload } from './payloads/findInventoryPayload';
import { UpdateInventoryPayload } from './payloads/updateInventoryPayload';
import { Inventory } from '../../../domain/entities/inventory/inventory';

export interface InventoryService {
  createInventory(input: CreateInventoryPayload): Promise<Inventory>;
  findInventory(input: FindInventoryPayload): Promise<Inventory>;
  findInventories(input: FindInventoriesPayload): Promise<Inventory[]>;
  updateInventory(input: UpdateInventoryPayload): Promise<Inventory>;
  deleteInventory(input: DeleteInventoryPayload): Promise<void>;
}
