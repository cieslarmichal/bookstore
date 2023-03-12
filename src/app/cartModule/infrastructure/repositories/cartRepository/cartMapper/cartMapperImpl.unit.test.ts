import 'reflect-metadata';

import { CartMapperImpl } from './cartMapperImpl';
import { DummyFactory } from '../../../../../../common/tests/dummyFactory';
import { LineItemMapper } from '../../../../../domain/lineItem/contracts/mappers/lineItemMapper/lineItemMapper';
import { CartEntityTestFactory } from '../../../../tests/factories/cartEntityTestFactory/cartEntityTestFactory';

describe('CartMapperImpl', () => {
  let lineItemMapper: LineItemMapper;
  let cartMapperImpl: CartMapperImpl;

  const cartEntityTestFactory = new CartEntityTestFactory();

  beforeAll(async () => {
    lineItemMapper = new DummyFactory().create();
    cartMapperImpl = new CartMapperImpl(lineItemMapper);
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
      lineItems: cartEntity.lineItems,
    });
  });
});
