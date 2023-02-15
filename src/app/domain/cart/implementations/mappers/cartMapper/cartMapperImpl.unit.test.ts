import 'reflect-metadata';

import { CartMapperImpl } from './cartMapperImpl';
import { CartEntityTestFactory } from '../../../tests/factories/cartEntityTestFactory/cartEntityTestFactory';

describe('CartMapperImpl', () => {
  let cartMapperImpl: CartMapperImpl;
  let cartEntityTestFactory: CartEntityTestFactory;

  beforeAll(async () => {
    cartEntityTestFactory = new CartEntityTestFactory();
    cartMapperImpl = new CartMapperImpl();
  });

  it('maps a cart entity to a cart', async () => {
    expect.assertions(1);

    const cartEntity = cartEntityTestFactory.create();

    const cart = cartMapperImpl.map(cartEntity);

    expect(cart).toEqual({
      id: cartEntity.id,
      customerId: cartEntity.customerId,
      status: cartEntity.status,
      totalPrice: cartEntity.totalPrice,
      deliveryMethod: cartEntity.deliveryMethod,
      billingAddressId: cartEntity.billingAddressId,
      shippingAddressId: cartEntity.shippingAddressId,
    });
  });
});
