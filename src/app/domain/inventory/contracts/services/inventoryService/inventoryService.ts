import { CreateInventoryPayload } from './createInventoryPayload';
import { DeleteInventoryPayload } from './deleteInventoryPayload';
import { FindInventoriesPayload } from './findInventoriesPayload';
import { FindInventoryPayload } from './findInventoryPayload';
import { UpdateInventoryPayload } from './updateInventoryPayload';
import { Inventory } from '../../inventory';

export interface InventoryService {
  createInventory(input: CreateInventoryPayload): Promise<Inventory>;
  findInventory(input: FindInventoryPayload): Promise<Inventory>;
  findInventories(input: FindInventoriesPayload): Promise<Inventory[]>;
  updateInventory(input: UpdateInventoryPayload): Promise<Inventory>;
  deleteInventory(input: DeleteInventoryPayload): Promise<void>;
}
