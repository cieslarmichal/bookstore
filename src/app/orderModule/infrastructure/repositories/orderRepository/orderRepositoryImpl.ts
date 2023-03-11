import { EntityManager } from 'typeorm';

import { OrderEntity } from './orderEntity/orderEntity';
import { OrderMapper } from './orderMapper/orderMapper';
import { Validator } from '../../../../../libs/validator/implementations/validator';
import { OrderRepository } from '../../../application/repositories/orderRepository/orderRepository';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../application/repositories/orderRepository/payloads/createOnePayload';
import {
  FindManyPayload,
  findManyPayloadSchema,
} from '../../../application/repositories/orderRepository/payloads/findManyPayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../application/repositories/orderRepository/payloads/findOnePayload';
import { Order } from '../../../domain/entities/order/order';

export class OrderRepositoryImpl implements OrderRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly orderMapper: OrderMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Order> {
    const { id, cartId, customerId, orderNumber, paymentMethod, status } = Validator.validate(
      createOnePayloadSchema,
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

  public async findOne(input: FindOnePayload): Promise<Order | null> {
    const { id } = Validator.validate(findOnePayloadSchema, input);

    const orderEntity = await this.entityManager.findOne(OrderEntity, { where: { id } });

    if (!orderEntity) {
      return null;
    }

    return this.orderMapper.map(orderEntity);
  }

  public async findMany(input: FindManyPayload): Promise<Order[]> {
    const { pagination, customerId } = Validator.validate(findManyPayloadSchema, input);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    const ordersEntities = await this.entityManager.find(OrderEntity, {
      skip: numberOfEnitiesToSkip,
      take: pagination.limit,
      where: { customerId },
    });

    return ordersEntities.map((orderEntity) => this.orderMapper.map(orderEntity));
  }
}
