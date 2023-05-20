import { FindCartsQueryHandler } from './findCartsQueryHandler';
import {
  FindCartsQueryHandlerPayload,
  findCartsQueryHandlerPayloadSchema,
} from './payloads/findCartsQueryHandlerPayload';
import { FindCartsQueryHandlerResult, findCartsQueryHandlerResultSchema } from './payloads/findCartsQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { orderSymbols } from '../../../symbols';
import { CartRepositoryFactory } from '../../repositories/cartRepository/cartRepositoryFactory';

@Injectable()
export class FindCartsQueryHandlerImpl implements FindCartsQueryHandler {
  public constructor(
    @Inject(orderSymbols.cartRepositoryFactory)
    private readonly cartRepositoryFactory: CartRepositoryFactory,
  ) {}

  public async execute(input: FindCartsQueryHandlerPayload): Promise<FindCartsQueryHandlerResult> {
    const { unitOfWork, customerId, pagination } = Validator.validate(findCartsQueryHandlerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const cartRepository = this.cartRepositoryFactory.create(entityManager);

    const carts = await cartRepository.findCarts({ customerId, pagination });

    return Validator.validate(findCartsQueryHandlerResultSchema, { carts });
  }
}
