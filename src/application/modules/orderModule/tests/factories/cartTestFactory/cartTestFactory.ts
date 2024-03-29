import { faker } from '@faker-js/faker';

import { Cart, CartInput } from '../../../../orderModule/domain/entities/cart/cart';
import { CartStatus } from '../../../../orderModule/domain/entities/cart/cartStatus';
import { DeliveryMethod } from '../../../../orderModule/domain/entities/cart/deliveryMethod';
import { LineItemTestFactory } from '../lineItemTestFactory/lineItemTestFactory';

export class CartTestFactory {
  public constructor(private readonly lineItemTestFactory: LineItemTestFactory) {}

  public create(input: Partial<CartInput> = {}): Cart {
    return new Cart({
      id: faker.datatype.uuid(),
      customerId: faker.datatype.uuid(),
      status: CartStatus.active,
      totalPrice: faker.datatype.number({ min: 0, max: 10000 }),
      deliveryMethod: faker.helpers.arrayElement([DeliveryMethod.fedex, DeliveryMethod.ups]),
      billingAddressId: faker.datatype.uuid(),
      shippingAddressId: faker.datatype.uuid(),
      lineItems: [this.lineItemTestFactory.create()],
      ...input,
    });
  }
}
