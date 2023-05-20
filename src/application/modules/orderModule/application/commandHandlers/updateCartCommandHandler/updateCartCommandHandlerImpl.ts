import {
  UpdateCartCommandHandlerPayload,
  updateCartCommandHandlerPayloadSchema,
} from './payloads/updateCartCommandHandlerPayload';
import {
  UpdateCartCommandHandlerResult,
  updateCartCommandHandlerResultSchema,
} from './payloads/updateCartCommandHandlerResult';
import { UpdateCartCommandHandler } from './updateCartCommandHandler';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { FindAddressQueryHandler } from '../../../../addressModule/application/queryHandlers/findAddressQueryHandler/findAddressQueryHandler';
import { addressSymbols } from '../../../../addressModule/symbols';
import { orderSymbols } from '../../../symbols';
import { CartRepositoryFactory } from '../../repositories/cartRepository/cartRepositoryFactory';

@Injectable()
export class UpdateCartCommandHandlerImpl implements UpdateCartCommandHandler {
  public constructor(
    @Inject(orderSymbols.cartRepositoryFactory)
    private readonly cartRepositoryFactory: CartRepositoryFactory,
    @Inject(addressSymbols.findAddressQueryHandler)
    private readonly findAddressQueryHandler: FindAddressQueryHandler,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: UpdateCartCommandHandlerPayload): Promise<UpdateCartCommandHandlerResult> {
    const {
      unitOfWork,
      cartId,
      draft: { billingAddressId, deliveryMethod, shippingAddressId, status },
    } = Validator.validate(updateCartCommandHandlerPayloadSchema, input);

    this.loggerService.debug({
      message: 'Updating cart...',
      context: { cartId, billingAddressId, deliveryMethod, shippingAddressId, status },
    });

    const entityManager = unitOfWork.getEntityManager();

    const cartRepository = this.cartRepositoryFactory.create(entityManager);

    if (billingAddressId) {
      await this.findAddressQueryHandler.execute({ unitOfWork, addressId: billingAddressId });
    }

    if (shippingAddressId) {
      await this.findAddressQueryHandler.execute({ unitOfWork, addressId: shippingAddressId });
    }

    const cart = await cartRepository.updateCart({
      id: cartId,
      draft: { billingAddressId, deliveryMethod, shippingAddressId, status },
    });

    this.loggerService.info({ message: 'Cart updated.', context: { cartId: cart.id } });

    return Validator.validate(updateCartCommandHandlerResultSchema, { cart });
  }
}
