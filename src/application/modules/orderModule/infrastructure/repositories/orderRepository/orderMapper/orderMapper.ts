import { Mapper } from '../../../../../../common/types/mapper';
import { Order } from '../../../../domain/entities/order/order';
import { OrderEntity } from '../orderEntity/orderEntity';

export type OrderMapper = Mapper<OrderEntity, Order>;
