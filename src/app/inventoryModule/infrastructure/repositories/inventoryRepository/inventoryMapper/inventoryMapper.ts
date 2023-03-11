import { Mapper } from '../../../../../../common/types/contracts/mapper';
import { Inventory } from '../../../../domain/entities/inventory/inventory';
import { InventoryEntity } from '../inventoryEntity/inventoryEntity';

export type InventoryMapper = Mapper<InventoryEntity, Inventory>;
