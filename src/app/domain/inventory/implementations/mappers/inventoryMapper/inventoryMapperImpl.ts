import { Injectable } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { Inventory } from '../../../contracts/inventory';
import { InventoryEntity } from '../../../contracts/inventoryEntity';
import { InventoryMapper } from '../../../contracts/mappers/inventoryMapper/inventoryMapper';

@Injectable()
export class InventoryMapperImpl implements InventoryMapper {
  public map({ id, bookId, quantity }: InventoryEntity): Inventory {
    return new Inventory({ id, bookId, quantity });
  }
}
