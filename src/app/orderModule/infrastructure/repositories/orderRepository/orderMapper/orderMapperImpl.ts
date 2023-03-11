import { OrderMapper } from './orderMapper';
import { Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { Order } from '../../../../domain/entities/order/order';
import { OrderEntity } from '../orderEntity/orderEntity';

@Injectable()
export class OrderMapperImpl implements OrderMapper {
  public map({ id, cartId, customerId, orderNumber, paymentMethod, status }: OrderEntity): Order {
    return new Order({ id, cartId, customerId, orderNumber, paymentMethod, status });
  }
}
