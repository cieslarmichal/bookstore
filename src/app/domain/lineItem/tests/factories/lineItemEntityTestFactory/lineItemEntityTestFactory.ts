import { faker } from '@faker-js/faker';

import { LineItemEntity } from '../../../contracts/lineItemEntity';

export class LineItemEntityTestFactory {
  public create(input: Partial<LineItemEntity> = {}): LineItemEntity {
    const quantity = input.quantity ?? faker.datatype.number({ min: 1, max: 10 });

    const price = input.price ?? faker.datatype.number({ min: 1, max: 1000 });

    const totalPrice = quantity * price;

    return {
      id: faker.datatype.uuid(),
      quantity,
      price,
      totalPrice,
      bookId: faker.datatype.uuid(),
      cartId: faker.datatype.uuid(),
      ...input,
    };
  }
}
