import { faker } from '@faker-js/faker';

import { OrderStatus } from '../../../domain/entities/order/orderStatus';
import { PaymentMethod } from '../../../domain/entities/order/paymentMethod';
import { OrderEntity } from '../../../infrastructure/repositories/orderRepository/orderEntity/orderEntity';

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
