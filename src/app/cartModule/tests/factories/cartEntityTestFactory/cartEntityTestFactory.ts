import { faker } from '@faker-js/faker';

import { CartStatus } from '../../../domain/entities/cart/cartStatus';
import { DeliveryMethod } from '../../../domain/entities/cart/deliveryMethod';
import { CartEntity } from '../../../infrastructure/repositories/cartRepository/cartEntity/cartEntity';

export class CartEntityTestFactory {
  public create(input: Partial<CartEntity> = {}): CartEntity {
    return {
      id: faker.datatype.uuid(),
      customerId: faker.datatype.uuid(),
      status: CartStatus.active,
      totalPrice: faker.datatype.number({ min: 0, max: 10000 }),
      deliveryMethod: faker.helpers.arrayElement([DeliveryMethod.fedex, DeliveryMethod.ups]),
      billingAddressId: faker.datatype.uuid(),
      shippingAddressId: faker.datatype.uuid(),
      lineItems: [],
      ...input,
    };
  }
}
