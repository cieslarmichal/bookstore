import { CreateCartCommandHandler } from './createCartCommandHandler';
import {
  CreateCartCommandHandlerPayload,
  createCartCommandHandlerPayloadSchema,
} from './payloads/createCartCommandHandlerPayload';
import {
  CreateCartCommandHandlerResult,
  createCartCommandHandlerResultSchema,
} from './payloads/createCartCommandHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { CartStatus } from '../../../domain/entities/cart/cartStatus';
import { orderSymbols } from '../../../symbols';
import { CartRepositoryFactory } from '../../repositories/cartRepository/cartRepositoryFactory';

@Injectable()
export class CreateCartCommandHandlerImpl implements CreateCartCommandHandler {
  public constructor(
    @Inject(orderSymbols.cartRepositoryFactory)
    private readonly cartRepositoryFactory: CartRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: CreateCartCommandHandlerPayload): Promise<CreateCartCommandHandlerResult> {
    const {
      unitOfWork,
      draft: { customerId },
    } = Validator.validate(createCartCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating cart...', context: { customerId } });

    const entityManager = unitOfWork.getEntityManager();

    const cartRepository = this.cartRepositoryFactory.create(entityManager);

    const cart = await cartRepository.createCart({
      id: UuidGenerator.generateUuid(),
      customerId,
      status: CartStatus.active,
      totalPrice: 0,
    });

    this.loggerService.info({ message: 'Cart created.', context: { cartId: cart.id, customerId } });

    return Validator.validate(createCartCommandHandlerResultSchema, { cart });
  }
}
