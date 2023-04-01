import { faker } from '@faker-js/faker';

import { LineItem } from '../../../../orderModule/domain/entities/lineItem/lineItem';

export class LineItemTestFactory {
  public create(input: Partial<LineItem> = {}): LineItem {
    const quantity = input.quantity ?? faker.datatype.number({ min: 1, max: 10 });

    const price = input.price ?? faker.datatype.number({ min: 1, max: 1000 });

    const totalPrice = quantity * price;

    return new LineItem({
      id: faker.datatype.uuid(),
      quantity,
      price,
      totalPrice,
      bookId: faker.datatype.uuid(),
      cartId: faker.datatype.uuid(),
      ...input,
    });
  }
}
