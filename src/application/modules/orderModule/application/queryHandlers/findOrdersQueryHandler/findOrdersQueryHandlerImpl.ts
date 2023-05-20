import { FindOrdersQueryHandler } from './findOrdersQueryHandler';
import {
  FindOrdersQueryHandlerPayload,
  findOrdersQueryHandlerPayloadSchema,
} from './payloads/findOrdersQueryHandlerPayload';
import {
  FindOrdersQueryHandlerResult,
  findOrdersQueryHandlerResultSchema,
} from './payloads/findOrdersQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { symbols } from '../../../symbols';
import { OrderRepositoryFactory } from '../../repositories/orderRepository/orderRepositoryFactory';

@Injectable()
export class FindOrdersQueryHandlerImpl implements FindOrdersQueryHandler {
  public constructor(
    @Inject(symbols.orderRepositoryFactory)
    private readonly orderRepositoryFactory: OrderRepositoryFactory,
  ) {}

  public async execute(input: FindOrdersQueryHandlerPayload): Promise<FindOrdersQueryHandlerResult> {
    const { unitOfWork, customerId, pagination } = Validator.validate(findOrdersQueryHandlerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const orderRepository = this.orderRepositoryFactory.create(entityManager);

    const orders = await orderRepository.findOrders({ customerId, pagination });

    return Validator.validate(findOrdersQueryHandlerResultSchema, { orders });
  }
}
