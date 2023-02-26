import 'reflect-metadata';

import { InventoryMapperImpl } from './inventoryMapperImpl';
import { InventoryEntityTestFactory } from '../../../tests/factories/inventoryEntityTestFactory/inventoryEntityTestFactory';

describe('InventoryMapperImpl', () => {
  let inventoryMapperImpl: InventoryMapperImpl;

  const inventoryEntityTestFactory = new InventoryEntityTestFactory();

  beforeAll(async () => {
    inventoryMapperImpl = new InventoryMapperImpl();
  });

  it('maps an inventory entity to an inventory', async () => {
    expect.assertions(1);

    const inventoryEntity = inventoryEntityTestFactory.create();

    const inventory = inventoryMapperImpl.map(inventoryEntity);

    expect(inventory).toEqual({
      id: inventoryEntity.id,
      bookId: inventoryEntity.bookId,
      quantity: inventoryEntity.quantity,
    });
  });
});
