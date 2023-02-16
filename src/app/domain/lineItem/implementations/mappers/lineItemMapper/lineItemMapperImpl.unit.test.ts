import 'reflect-metadata';

import { LineItemMapperImpl } from './lineItemMapperImpl';
import { LineItemEntityTestFactory } from '../../../tests/factories/lineItemEntityTestFactory/lineItemEntityTestFactory';

describe('LineItemMapperImpl', () => {
  let lineItemMapperImpl: LineItemMapperImpl;
  let lineItemEntityTestFactory: LineItemEntityTestFactory;

  beforeAll(async () => {
    lineItemEntityTestFactory = new LineItemEntityTestFactory();
    lineItemMapperImpl = new LineItemMapperImpl();
  });

  it('map a line item entity to a line item', async () => {
    expect.assertions(1);

    const lineItemEntity = lineItemEntityTestFactory.create();

    const lineItem = lineItemMapperImpl.map(lineItemEntity);

    expect(lineItem).toEqual({
      id: lineItemEntity.id,
      quantity: lineItemEntity.quantity,
      price: lineItemEntity.price,
      totalPrice: lineItemEntity.totalPrice,
      bookId: lineItemEntity.bookId,
      cartId: lineItemEntity.cartId,
    });
  });
});
