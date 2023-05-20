import { FindCartQueryHandler } from './findCartQueryHandler';
import { FindCartQueryHandlerPayload, findCartQueryHandlerPayloadSchema } from './payloads/findCartQueryHandlerPayload';
import { FindCartQueryHandlerResult, findCartQueryHandlerResultSchema } from './payloads/findCartQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { CartNotFoundError } from '../../../infrastructure/errors/cartNotFoundError';
import { orderSymbols } from '../../../symbols';
import { CartRepositoryFactory } from '../../repositories/cartRepository/cartRepositoryFactory';

@Injectable()
export class FindCartQueryHandlerImpl implements FindCartQueryHandler {
  public constructor(
    @Inject(orderSymbols.cartRepositoryFactory)
    private readonly cartRepositoryFactory: CartRepositoryFactory,
  ) {}

  public async execute(input: FindCartQueryHandlerPayload): Promise<FindCartQueryHandlerResult> {
    const { unitOfWork, cartId } = Validator.validate(findCartQueryHandlerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const cartRepository = this.cartRepositoryFactory.create(entityManager);

    const cart = await cartRepository.findCart({ id: cartId });

    if (!cart) {
      throw new CartNotFoundError({ id: cartId });
    }

    return Validator.validate(findCartQueryHandlerResultSchema, { cart });
  }
}
