import 'reflect-metadata';

import { OrderMapperImpl } from './orderMapperImpl';
import { OrderEntityTestFactory } from '../../../../tests/factories/orderEntityTestFactory/orderEntityTestFactory';

describe('OrderMapperImpl', () => {
  let orderMapperImpl: OrderMapperImpl;

  const orderEntityTestFactory = new OrderEntityTestFactory();

  beforeAll(async () => {
    orderMapperImpl = new OrderMapperImpl();
  });

  it('maps an order entity to an order', async () => {
    expect.assertions(1);

    const orderEntity = orderEntityTestFactory.create();

    const order = orderMapperImpl.map(orderEntity);

    expect(order).toEqual({
      id: orderEntity.id,
      cartId: orderEntity.cartId,
      customerId: orderEntity.customerId,
      orderNumber: orderEntity.orderNumber,
      status: orderEntity.status,
      paymentMethod: orderEntity.paymentMethod,
    });
  });
});
