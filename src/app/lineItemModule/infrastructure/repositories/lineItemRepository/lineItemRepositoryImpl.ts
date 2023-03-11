import { EntityManager } from 'typeorm';

import { LineItemEntity } from './lineItemEntity/lineItemEntity';
import { LineItemMapper } from './lineItemMapper/lineItemMapper';
import { Validator } from '../../../../../libs/validator/implementations/validator';
import { LineItemRepository } from '../../../application/repositories/lineItemRepository/lineItemRepository';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../application/repositories/lineItemRepository/payloads/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../application/repositories/lineItemRepository/payloads/deleteOnePayload';
import {
  FindManyPayload,
  findManyPayloadSchema,
} from '../../../application/repositories/lineItemRepository/payloads/findManyPayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../application/repositories/lineItemRepository/payloads/findOnePayload';
import {
  UpdateOnePayload,
  updateOnePayloadSchema,
} from '../../../application/repositories/lineItemRepository/payloads/updateOnePayload';
import { LineItem } from '../../../domain/entities/lineItem/lineItem';
import { LineItemNotFoundError } from '../../../infrastructure/errors/lineItemNotFoundError';

export class LineItemRepositoryImpl implements LineItemRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly lineItemMapper: LineItemMapper) {}

  public async createOne(input: CreateOnePayload): Promise<LineItem> {
    const { id, price, totalPrice, quantity, bookId, cartId } = Validator.validate(createOnePayloadSchema, input);

    const lineItemEntity = this.entityManager.create(LineItemEntity, {
      id,
      price,
      totalPrice,
      quantity,
      bookId,
      cartId,
    });

    const savedLineItemEntity = await this.entityManager.save(lineItemEntity);

    return this.lineItemMapper.map(savedLineItemEntity);
  }

  public async findOne(input: FindOnePayload): Promise<LineItem | null> {
    const { id } = Validator.validate(findOnePayloadSchema, input);

    const lineItemEntity = await this.entityManager.findOne(LineItemEntity, { where: { id } });

    if (!lineItemEntity) {
      return null;
    }

    return this.lineItemMapper.map(lineItemEntity);
  }

  public async findMany(input: FindManyPayload): Promise<LineItem[]> {
    const { pagination, cartId } = Validator.validate(findManyPayloadSchema, input);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    const lineItemesEntities = await this.entityManager.find(LineItemEntity, {
      skip: numberOfEnitiesToSkip,
      take: pagination.limit,
      where: { cartId },
    });

    return lineItemesEntities.map((lineItem) => this.lineItemMapper.map(lineItem));
  }

  public async updateOne(input: UpdateOnePayload): Promise<LineItem> {
    const {
      id,
      draft: { price, totalPrice, quantity },
    } = Validator.validate(updateOnePayloadSchema, input);

    const lineItemEntity = await this.findOne({ id });

    if (!lineItemEntity) {
      throw new LineItemNotFoundError({ id });
    }

    let lineItemEntityInput: Partial<LineItemEntity> = {};

    if (price !== undefined) {
      lineItemEntityInput = { ...lineItemEntityInput, price };
    }

    if (totalPrice !== undefined) {
      lineItemEntityInput = { ...lineItemEntityInput, totalPrice };
    }

    if (quantity !== undefined) {
      lineItemEntityInput = { ...lineItemEntityInput, quantity };
    }

    await this.entityManager.update(LineItemEntity, { id }, { ...lineItemEntityInput });

    const updatedLineItemEntity = await this.findOne({ id });

    return updatedLineItemEntity as LineItem;
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = Validator.validate(deleteOnePayloadSchema, input);

    const lineItemEntity = await this.findOne({ id });

    if (!lineItemEntity) {
      throw new LineItemNotFoundError({ id });
    }

    await this.entityManager.delete(LineItemEntity, { id });
  }
}
