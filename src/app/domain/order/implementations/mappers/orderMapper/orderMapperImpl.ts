import { Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { OrderMapper } from '../../../contracts/mappers/orderMapper/orderMapper';
import { Order } from '../../../contracts/order';
import { OrderEntity } from '../../../contracts/orderEntity';

@Injectable()
export class OrderMapperImpl implements OrderMapper {
  public map({ id, cartId, customerId, orderNumber, paymentMethod, status }: OrderEntity): Order {
    return new Order({ id, cartId, customerId, orderNumber, paymentMethod, status });
  }
}
