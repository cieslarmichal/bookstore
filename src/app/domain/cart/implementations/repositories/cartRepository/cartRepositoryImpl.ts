import { EntityManager } from 'typeorm';

import { PayloadFactory } from '../../../../../common/validator/implementations/payloadFactory';
import { Cart } from '../../../contracts/cart';
import { CartEntity } from '../../../contracts/cartEntity';
import { CartMapper } from '../../../contracts/mappers/cartMapper/cartMapper';
import { CartRepository } from '../../../contracts/repositories/cartRepository/cartRepository';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../contracts/repositories/cartRepository/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../contracts/repositories/cartRepository/deleteOnePayload';
import { FindOnePayload, findOnePayloadSchema } from '../../../contracts/repositories/cartRepository/findOnePayload';
import {
  UpdateOnePayload,
  updateOnePayloadSchema,
} from '../../../contracts/repositories/cartRepository/updateOnePayload';
import { CartNotFoundError } from '../../../errors/cartNotFoundError';

export class CartRepositoryImpl implements CartRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly cartMapper: CartMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Cart> {
    const { id, customerId, status, totalPrice, billingAddressId, deliveryMethod, shippingAddressId } =
      PayloadFactory.create(createOnePayloadSchema, input);

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
    const { id } = PayloadFactory.create(findOnePayloadSchema, input);

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
    } = PayloadFactory.create(updateOnePayloadSchema, input);

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
    const { id } = PayloadFactory.create(deleteOnePayloadSchema, input);

    const cartEntity = await this.findOne({ id });

    if (!cartEntity) {
      throw new CartNotFoundError({ id });
    }

    await this.entityManager.delete(CartEntity, { id });
  }
}
