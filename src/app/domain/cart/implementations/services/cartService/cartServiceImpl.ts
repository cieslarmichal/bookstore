import { PayloadFactory } from '../../../../../common/validator/implementations/payloadFactory';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { loggerSymbols } from '../../../../../libs/logger/loggerSymbols';
import { UuidGenerator } from '../../../../../libs/uuid/implementations/uuidGenerator';
import { cartSymbols } from '../../../cartSymbols';
import { Cart } from '../../../contracts/cart';
import { CartStatus } from '../../../contracts/cartStatus';
import { CartRepositoryFactory } from '../../../contracts/factories/cartRepositoryFactory/cartRepositoryFactory';
import { CartService } from '../../../contracts/services/cartService/cartService';
import { CreateCartPayload, createCartPayloadSchema } from '../../../contracts/services/cartService/createCartPayload';
import { DeleteCartPayload, deleteCartPayloadSchema } from '../../../contracts/services/cartService/deleteCartPayload';
import { FindCartPayload, findCartPayloadSchema } from '../../../contracts/services/cartService/findCartPayload';
import { UpdateCartPayload, updateCartPayloadSchema } from '../../../contracts/services/cartService/updateCartPayload';
import { CartNotFoundError } from '../../../errors/cartNotFoundError';

@Injectable()
export class CartServiceImpl implements CartService {
  public constructor(
    @Inject(cartSymbols.cartRepositoryFactory)
    private readonly cartRepositoryFactory: CartRepositoryFactory,
    @Inject(loggerSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async createCart(input: CreateCartPayload): Promise<Cart> {
    const {
      unitOfWork,
      draft: { customerId },
    } = PayloadFactory.create(createCartPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating cart...', context: { customerId } });

    const entityManager = unitOfWork.getEntityManager();

    const cartRepository = this.cartRepositoryFactory.create(entityManager);

    const cart = await cartRepository.createOne({
      id: UuidGenerator.generateUuid(),
      customerId,
      status: CartStatus.active,
      totalPrice: 0,
    });

    this.loggerService.info({ message: 'Cart created.', context: { cartId: cart.id } });

    return cart;
  }

  public async findCart(input: FindCartPayload): Promise<Cart> {
    const { unitOfWork, cartId } = PayloadFactory.create(findCartPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const cartRepository = this.cartRepositoryFactory.create(entityManager);

    const cart = await cartRepository.findOne({ id: cartId });

    if (!cart) {
      throw new CartNotFoundError({ id: cartId });
    }

    return cart;
  }

  public async updateCart(input: UpdateCartPayload): Promise<Cart> {
    const {
      unitOfWork,
      cartId,
      draft: { billingAddressId, deliveryMethod, shippingAddressId, status },
    } = PayloadFactory.create(updateCartPayloadSchema, input);

    this.loggerService.debug({
      message: 'Updating cart...',
      context: { cartId, billingAddressId, deliveryMethod, shippingAddressId, status },
    });

    const entityManager = unitOfWork.getEntityManager();

    const cartRepository = this.cartRepositoryFactory.create(entityManager);

    const cart = await cartRepository.updateOne({
      id: cartId,
      draft: { billingAddressId, deliveryMethod, shippingAddressId, status },
    });

    this.loggerService.info({ message: 'Cart updated.', context: { cartId: cart.id } });

    return cart;
  }

  public async deleteCart(input: DeleteCartPayload): Promise<void> {
    const { unitOfWork, cartId } = PayloadFactory.create(deleteCartPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting cart...', context: { cartId } });

    const entityManager = unitOfWork.getEntityManager();

    const cartRepository = this.cartRepositoryFactory.create(entityManager);

    await cartRepository.deleteOne({ id: cartId });

    this.loggerService.info({ message: 'Cart deleted.', context: { cartId } });
  }
}
