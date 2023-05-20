import { EntityManager } from 'typeorm';

import { OrderEntity } from './orderEntity/orderEntity';
import { OrderMapper } from './orderMapper/orderMapper';
import { Validator } from '../../../../../../libs/validator/validator';
import { OrderRepository } from '../../../application/repositories/orderRepository/orderRepository';
import {
  CreateOrderPayload,
  createOrderPayloadSchema,
} from '../../../application/repositories/orderRepository/payloads/createOrderPayload';
import {
  FindOrdersPayload,
  findOrdersPayloadSchema,
} from '../../../application/repositories/orderRepository/payloads/findOrdersPayload';
import {
  FindOrderPayload,
  findOrderPayloadSchema,
} from '../../../application/repositories/orderRepository/payloads/findOrderPayload';
import { Order } from '../../../domain/entities/order/order';

export class OrderRepositoryImpl implements OrderRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly orderMapper: OrderMapper) {}

  public async createOrder(input: CreateOrderPayload): Promise<Order> {
    const { id, cartId, customerId, orderNumber, paymentMethod, status } = Validator.validate(
      createOrderPayloadSchema,
      input,
    );

    const orderEntity = this.entityManager.create(OrderEntity, {
      id,
      cartId,
      customerId,
      orderNumber,
      paymentMethod,
      status,
    });

    const savedOrderEntity = await this.entityManager.save(orderEntity);

    return this.orderMapper.map(savedOrderEntity);
  }

  public async findOrder(input: FindOrderPayload): Promise<Order | null> {
    const { id } = Validator.validate(findOrderPayloadSchema, input);

    const orderEntity = await this.entityManager.findOne(OrderEntity, { where: { id } });

    if (!orderEntity) {
      return null;
    }

    return this.orderMapper.map(orderEntity);
  }

  public async findOrders(input: FindOrdersPayload): Promise<Order[]> {
    const { pagination, customerId } = Validator.validate(findOrdersPayloadSchema, input);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    const ordersEntities = await this.entityManager.find(OrderEntity, {
      skip: numberOfEnitiesToSkip,
      take: pagination.limit,
      where: { customerId },
    });

    return ordersEntities.map((orderEntity) => this.orderMapper.map(orderEntity));
  }
}
