import { faker } from '@faker-js/faker';

import { CartEntity } from '../../../contracts/cartEntity';
import { CartStatus } from '../../../contracts/cartStatus';
import { DeliveryMethod } from '../../../contracts/deliveryMethod';

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
      ...input,
    };
  }
}
