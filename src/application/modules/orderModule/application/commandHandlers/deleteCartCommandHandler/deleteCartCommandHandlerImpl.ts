import { DeleteCartCommandHandler } from './deleteCartCommandHandler';
import {
  DeleteCartCommandHandlerPayload,
  deleteCartCommandHandlerPayloadSchema,
} from './payloads/deleteCartCommandHandlerPayload';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { orderSymbols } from '../../../symbols';
import { CartRepositoryFactory } from '../../repositories/cartRepository/cartRepositoryFactory';

@Injectable()
export class DeleteCartCommandHandlerImpl implements DeleteCartCommandHandler {
  public constructor(
    @Inject(orderSymbols.cartRepositoryFactory)
    private readonly cartRepositoryFactory: CartRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: DeleteCartCommandHandlerPayload): Promise<void> {
    const { unitOfWork, cartId } = Validator.validate(deleteCartCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting cart...', context: { cartId } });

    const entityManager = unitOfWork.getEntityManager();

    const cartRepository = this.cartRepositoryFactory.create(entityManager);

    await cartRepository.deleteCart({ id: cartId });

    this.loggerService.info({ message: 'Cart deleted.', context: { cartId } });
  }
}
