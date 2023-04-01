import { InventoryMapper } from './inventoryMapper';
import { Injectable } from '../../../../../../../libs/dependencyInjection/decorators';
import { Inventory } from '../../../../domain/entities/inventory/inventory';
import { InventoryEntity } from '../inventoryEntity/inventoryEntity';

@Injectable()
export class InventoryMapperImpl implements InventoryMapper {
  public map({ id, bookId, quantity }: InventoryEntity): Inventory {
    return new Inventory({ id, bookId, quantity });
  }
}
