import { faker } from '@faker-js/faker';

import { Inventory } from '../../../contracts/inventory';

export class InventoryTestFactory {
  public create(input: Partial<Inventory> = {}): Inventory {
    return new Inventory({
      id: faker.datatype.uuid(),
      bookId: faker.datatype.uuid(),
      quantity: faker.datatype.number({ min: 0, max: 100 }),
      ...input,
    });
  }
}
