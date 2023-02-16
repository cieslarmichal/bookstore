import { faker } from '@faker-js/faker';

import { LineItemEntity } from '../../../contracts/lineItemEntity';

export class LineItemEntityTestFactory {
  public create(input: Partial<LineItemEntity> = {}): LineItemEntity {
    return {
      id: faker.datatype.uuid(),
      quantity: faker.datatype.number({ min: 1, max: 10 }),
      price: faker.datatype.number({ min: 1, max: 1000 }),
      totalPrice: faker.datatype.number({ min: 1, max: 1000 }),
      bookId: faker.datatype.uuid(),
      cartId: faker.datatype.uuid(),
      ...input,
    };
  }
}
