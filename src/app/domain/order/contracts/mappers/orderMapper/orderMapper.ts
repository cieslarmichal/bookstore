import { Mapper } from '../../../../../common/types/contracts/mapper';
import { Order } from '../../order';
import { OrderEntity } from '../../orderEntity';

export type OrderMapper = Mapper<OrderEntity, Order>;
