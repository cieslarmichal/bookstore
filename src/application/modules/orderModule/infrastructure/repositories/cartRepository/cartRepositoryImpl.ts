import { EntityManager } from 'typeorm';

import { CartEntity } from './cartEntity/cartEntity';
import { CartMapper } from './cartMapper/cartMapper';
import { Validator } from '../../../../../libs/validator/validator';
import { Cart } from '../../../../orderModule/domain/entities/cart/cart';
import { CartNotFoundError } from '../../../../orderModule/infrastructure/errors/cartNotFoundError';
import { CartRepository } from '../../../application/repositories/cartRepository/cartRepository';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../application/repositories/cartRepository/payloads/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../application/repositories/cartRepository/payloads/deleteOnePayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../application/repositories/cartRepository/payloads/findOnePayload';
import {
  UpdateOnePayload,
  updateOnePayloadSchema,
} from '../../../application/repositories/cartRepository/payloads/updateOnePayload';

export class CartRepositoryImpl implements CartRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly cartMapper: CartMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Cart> {
    const { id, customerId, status, totalPrice, billingAddressId, deliveryMethod, shippingAddressId } =
      Validator.validate(createOnePayloadSchema, input);

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

  public async findOne(input: FindOnePayload): Promise<Cart | null> {
    const { id } = Validator.validate(findOnePayloadSchema, input);

    const cartEntity = await this.entityManager.findOne(CartEntity, { where: { id } });

    if (!cartEntity) {
      return null;
    }

    return this.cartMapper.map(cartEntity);
  }

  public async updateOne(input: UpdateOnePayload): Promise<Cart> {
    const {
      id,
      draft: { status, totalPrice, billingAddressId, deliveryMethod, shippingAddressId },
    } = Validator.validate(updateOnePayloadSchema, input);

    const cartEntity = await this.findOne({ id });

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

    const updatedCartEntity = await this.findOne({ id });

    return updatedCartEntity as Cart;
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = Validator.validate(deleteOnePayloadSchema, input);

    const cartEntity = await this.findOne({ id });

    if (!cartEntity) {
      throw new CartNotFoundError({ id });
    }

    await this.entityManager.delete(CartEntity, { id });
  }
}
