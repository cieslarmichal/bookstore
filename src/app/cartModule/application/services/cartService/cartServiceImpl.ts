import { CartService } from './cartService';
import { AddLineItemPayload, addLineItemPayloadSchema } from './payloads/addLineItemPayload';
import { CreateCartPayload, createCartPayloadSchema } from './payloads/createCartPayload';
import { DeleteCartPayload, deleteCartPayloadSchema } from './payloads/deleteCartPayload';
import { FindCartPayload, findCartPayloadSchema } from './payloads/findCartPayload';
import { RemoveLineItemPayload, removeLineItemPayloadSchema } from './payloads/removeLineItemPayload';
import { UpdateCartPayload, updateCartPayloadSchema } from './payloads/updateCartPayload';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { loggerModuleSymbols } from '../../../../../libs/logger/loggerModuleSymbols';
import { UuidGenerator } from '../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../libs/validator/implementations/validator';
import { addressModuleSymbols } from '../../../../addressModule/addressModuleSymbols';
import { AddressService } from '../../../../addressModule/application/services/addressService/addressService';
import { BookService } from '../../../../bookModule/application/services/bookService/bookService';
import { bookModuleSymbols } from '../../../../bookModule/bookModuleSymbols';
import { InventoryService } from '../../../../domain/inventory/contracts/services/inventoryService/inventoryService';
import { inventorySymbols } from '../../../../domain/inventory/inventorySymbols';
import { LineItemRepositoryFactory } from '../../../../domain/lineItem/contracts/factories/lineItemRepositoryFactory/lineItemRepositoryFactory';
import { LineItemNotFoundError } from '../../../../domain/lineItem/errors/lineItemNotFoundError';
import { lineItemSymbols } from '../../../../domain/lineItem/lineItemSymbols';
import { cartModuleSymbols } from '../../../cartModuleSymbols';
import { Cart } from '../../../domain/entities/cart/cart';
import { CartStatus } from '../../../domain/entities/cart/cartStatus';
import { CartNotFoundError } from '../../../infrastructure/errors/cartNotFoundError';
import { LineItemOutOfInventoryError } from '../../../infrastructure/errors/lineItemOutOfInventoryError';
import { CartRepositoryFactory } from '../../repositories/cartRepository/cartRepositoryFactory';

@Injectable()
export class CartServiceImpl implements CartService {
  public constructor(
    @Inject(cartModuleSymbols.cartRepositoryFactory)
    private readonly cartRepositoryFactory: CartRepositoryFactory,
    @Inject(lineItemSymbols.lineItemRepositoryFactory)
    private readonly lineItemRepositoryFactory: LineItemRepositoryFactory,
    @Inject(bookModuleSymbols.bookService)
    private readonly bookService: BookService,
    @Inject(addressModuleSymbols.addressService)
    private readonly addressService: AddressService,
    @Inject(inventorySymbols.inventoryService)
    private readonly inventoryService: InventoryService,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async createCart(input: CreateCartPayload): Promise<Cart> {
    const {
      unitOfWork,
      draft: { customerId },
    } = Validator.validate(createCartPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating cart...', context: { customerId } });

    const entityManager = unitOfWork.getEntityManager();

    const cartRepository = this.cartRepositoryFactory.create(entityManager);

    const cart = await cartRepository.createOne({
      id: UuidGenerator.generateUuid(),
      customerId,
      status: CartStatus.active,
      totalPrice: 0,
    });

    this.loggerService.info({ message: 'Cart created.', context: { cartId: cart.id, customerId } });

    return cart;
  }

  public async findCart(input: FindCartPayload): Promise<Cart> {
    const { unitOfWork, cartId } = Validator.validate(findCartPayloadSchema, input);

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
    } = Validator.validate(updateCartPayloadSchema, input);

    this.loggerService.debug({
      message: 'Updating cart...',
      context: { cartId, billingAddressId, deliveryMethod, shippingAddressId, status },
    });

    const entityManager = unitOfWork.getEntityManager();

    const cartRepository = this.cartRepositoryFactory.create(entityManager);

    if (billingAddressId) {
      await this.addressService.findAddress({ unitOfWork, addressId: billingAddressId });
    }

    if (shippingAddressId) {
      await this.addressService.findAddress({ unitOfWork, addressId: shippingAddressId });
    }

    const cart = await cartRepository.updateOne({
      id: cartId,
      draft: { billingAddressId, deliveryMethod, shippingAddressId, status },
    });

    this.loggerService.info({ message: 'Cart updated.', context: { cartId: cart.id } });

    return cart;
  }

  public async addLineItem(input: AddLineItemPayload): Promise<Cart> {
    const {
      unitOfWork,
      cartId,
      draft: { bookId, quantity },
    } = Validator.validate(addLineItemPayloadSchema, input);

    this.loggerService.debug({ message: 'Adding line item to a cart...', context: { cartId, bookId, quantity } });

    const entityManager = unitOfWork.getEntityManager();

    const lineItemRepository = this.lineItemRepositoryFactory.create(entityManager);

    const cartRepository = this.cartRepositoryFactory.create(entityManager);

    const cart = await this.findCart({ unitOfWork, cartId });

    const inventory = await this.inventoryService.findInventory({ unitOfWork, bookId });

    if (inventory.quantity < quantity) {
      throw new LineItemOutOfInventoryError({ inventoryQuantity: inventory.quantity, lineItemQuantity: quantity });
    }

    const { price } = await this.bookService.findBook({ unitOfWork, bookId });

    const totalLineItemPrice = price * quantity;

    await lineItemRepository.createOne({
      id: UuidGenerator.generateUuid(),
      cartId,
      bookId,
      quantity,
      price,
      totalPrice: totalLineItemPrice,
    });

    const cartTotalPrice = cart.totalPrice + totalLineItemPrice;

    const updatedCart = await cartRepository.updateOne({
      id: cartId,
      draft: { totalPrice: cartTotalPrice },
    });

    this.loggerService.info({ message: 'Line item added to a cart.', context: { cartId, bookId, quantity } });

    return updatedCart;
  }

  public async removeLineItem(input: RemoveLineItemPayload): Promise<Cart> {
    const {
      unitOfWork,
      cartId,
      draft: { lineItemId, quantity },
    } = Validator.validate(removeLineItemPayloadSchema, input);

    this.loggerService.debug({
      message: 'Removing line item from a cart...',
      context: { cartId, lineItemId, quantity },
    });

    const entityManager = unitOfWork.getEntityManager();

    const lineItemRepository = this.lineItemRepositoryFactory.create(entityManager);

    const cartRepository = this.cartRepositoryFactory.create(entityManager);

    const cart = await this.findCart({ unitOfWork, cartId });

    const existingLineItem = await lineItemRepository.findOne({ id: lineItemId });

    if (!existingLineItem) {
      throw new LineItemNotFoundError({ id: lineItemId });
    }

    let totalLineItemPrice: number;

    if (existingLineItem.quantity <= quantity) {
      totalLineItemPrice = existingLineItem.totalPrice;

      await lineItemRepository.deleteOne({ id: lineItemId });
    } else {
      const updatedQuantity = existingLineItem.quantity - quantity;

      totalLineItemPrice = existingLineItem.price * updatedQuantity;

      await lineItemRepository.updateOne({
        id: lineItemId,
        draft: { quantity: updatedQuantity, totalPrice: totalLineItemPrice },
      });
    }

    const cartTotalPrice = cart.totalPrice - totalLineItemPrice;

    const updatedCart = await cartRepository.updateOne({
      id: cartId,
      draft: { totalPrice: cartTotalPrice },
    });

    this.loggerService.info({ message: 'Line item removed from a cart.', context: { cartId, lineItemId, quantity } });

    return updatedCart;
  }

  public async deleteCart(input: DeleteCartPayload): Promise<void> {
    const { unitOfWork, cartId } = Validator.validate(deleteCartPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting cart...', context: { cartId } });

    const entityManager = unitOfWork.getEntityManager();

    const cartRepository = this.cartRepositoryFactory.create(entityManager);

    await cartRepository.deleteOne({ id: cartId });

    this.loggerService.info({ message: 'Cart deleted.', context: { cartId } });
  }
}
