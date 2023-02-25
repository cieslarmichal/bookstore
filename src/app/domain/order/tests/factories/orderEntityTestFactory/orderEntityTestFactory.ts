import { faker } from '@faker-js/faker';

import { OrderEntity } from '../../../contracts/orderEntity';
import { OrderStatus } from '../../../contracts/orderStatus';
import { PaymentMethod } from '../../../contracts/paymentMethod';

export class OrderEntityTestFactory {
  public create(input: Partial<OrderEntity> = {}): OrderEntity {
    return {
      id: faker.datatype.uuid(),
      cartId: faker.datatype.uuid(),
      customerId: faker.datatype.uuid(),
      orderNumber: faker.datatype.uuid(),
      paymentMethod: PaymentMethod.bankTransfer,
      status: OrderStatus.created,
      ...input,
    };
  }
}
