import { faker } from '@faker-js/faker';

import { InventoryEntity } from '../../../infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';

export class InventoryEntityTestFactory {
  public create(input: Partial<InventoryEntity> = {}): InventoryEntity {
    return {
      id: faker.datatype.uuid(),
      bookId: faker.datatype.uuid(),
      quantity: faker.datatype.number({ min: 0, max: 100 }),
      ...input,
    };
  }
}
