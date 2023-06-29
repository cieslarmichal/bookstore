import { EntityManager } from 'typeorm';

import { CartEntity } from './cartEntity/cartEntity';
import { CartMapper } from './cartMapper/cartMapper';
import { Validator } from '../../../../../../libs/validator/validator';
import { CartNotFoundError } from '../../../application/errors/cartNotFoundError';
import { CartRepository } from '../../../application/repositories/cartRepository/cartRepository';
import {
  CreateCartPayload,
  createCartPayloadSchema,
} from '../../../application/repositories/cartRepository/payloads/createCartPayload';
import {
  DeleteCartPayload,
  deleteCartPayloadSchema,
} from '../../../application/repositories/cartRepository/payloads/deleteCartPayload';
import {
  FindCartPayload,
  findCartPayloadSchema,
} from '../../../application/repositories/cartRepository/payloads/findCartPayload';
import {
  FindCartsPayload,
  findCartsPayloadSchema,
} from '../../../application/repositories/cartRepository/payloads/findCartsPayload';
import {
  UpdateCartPayload,
  updateCartPayloadSchema,
} from '../../../application/repositories/cartRepository/payloads/updateCartPayload';
import { Cart } from '../../../domain/entities/cart/cart';

export class CartRepositoryImpl implements CartRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly cartMapper: CartMapper) {}

  public async createCart(input: CreateCartPayload): Promise<Cart> {
    const { id, customerId, status, totalPrice, billingAddressId, deliveryMethod, shippingAddressId } =
      Validator.validate(createCartPayloadSchema, input);

    let cartEntityInput: CartEntity = {
      id,
      customerId,
      status,
      totalPrice,
    };

    if (billingAddressId) {
      cartEntityInput = { ...cartEntityInput, billingAddressId };
    }

    if (shippingAddressId) {
      cartEntityInput = { ...cartEntityInput, shippingAddressId };
    }

    if (deliveryMethod) {
      cartEntityInput = { ...cartEntityInput, deliveryMethod };
    }

    const cartEntity = this.entityManager.create(CartEntity, cartEntityInput);

    const savedCartEntity = await this.entityManager.save(cartEntity);

    return this.cartMapper.map(savedCartEntity);
  }

  public async findCarts(input: FindCartsPayload): Promise<Cart[]> {
    const { pagination, customerId } = Validator.validate(findCartsPayloadSchema, input);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    const cartsEntities = await this.entityManager.find(CartEntity, {
      skip: numberOfEnitiesToSkip,
      take: pagination.limit,
      where: { customerId },
    });

    return cartsEntities.map((cartEntity) => this.cartMapper.map(cartEntity));
  }

  public async findCart(input: FindCartPayload): Promise<Cart | null> {
    const { id } = Validator.validate(findCartPayloadSchema, input);

    const cartEntity = await this.entityManager.findOne(CartEntity, { where: { id } });

    if (!cartEntity) {
      return null;
    }

    return this.cartMapper.map(cartEntity);
  }

  public async updateCart(input: UpdateCartPayload): Promise<Cart> {
    const {
      id,
      draft: { status, totalPrice, billingAddressId, deliveryMethod, shippingAddressId },
    } = Validator.validate(updateCartPayloadSchema, input);

    const cartEntity = await this.findCart({ id });

    if (!cartEntity) {
      throw new CartNotFoundError({ id });
    }

    let cartEntityInput: Partial<CartEntity> = {};

    if (status) {
      cartEntityInput = { ...cartEntityInput, status };
    }

    if (totalPrice !== undefined) {
      cartEntityInput = { ...cartEntityInput, totalPrice };
    }

    if (billingAddressId) {
      cartEntityInput = { ...cartEntityInput, billingAddressId };
    }

    if (shippingAddressId) {
      cartEntityInput = { ...cartEntityInput, shippingAddressId };
    }

    if (deliveryMethod) {
      cartEntityInput = { ...cartEntityInput, deliveryMethod };
    }

    await this.entityManager.update(CartEntity, { id }, { ...cartEntityInput });

    const updatedCartEntity = await this.findCart({ id });

    return updatedCartEntity as Cart;
  }

  public async deleteCart(input: DeleteCartPayload): Promise<void> {
    const { id } = Validator.validate(deleteCartPayloadSchema, input);

    const cartEntity = await this.findCart({ id });

    if (!cartEntity) {
      throw new CartNotFoundError({ id });
    }

    await this.entityManager.delete(CartEntity, { id });
  }
}
