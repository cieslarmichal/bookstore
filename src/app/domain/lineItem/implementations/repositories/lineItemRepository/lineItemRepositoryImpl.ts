import { EntityManager } from 'typeorm';

import { PayloadFactory } from '../../../../../common/validator/implementations/payloadFactory';
import { LineItem } from '../../../contracts/lineItem';
import { LineItemEntity } from '../../../contracts/lineItemEntity';
import { LineItemMapper } from '../../../contracts/mappers/lineItemMapper/lineItemMapper';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../contracts/repositories/lineItemRepository/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../contracts/repositories/lineItemRepository/deleteOnePayload';
import {
  FindManyPayload,
  findManyPayloadSchema,
} from '../../../contracts/repositories/lineItemRepository/findManyPayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../contracts/repositories/lineItemRepository/findOnePayload';
import { LineItemRepository } from '../../../contracts/repositories/lineItemRepository/lineItemRepository';
import {
  UpdateOnePayload,
  updateOnePayloadSchema,
} from '../../../contracts/repositories/lineItemRepository/updateOnePayload';
import { LineItemNotFoundError } from '../../../errors/lineItemNotFoundError';

export class LineItemRepositoryImpl implements LineItemRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly lineItemMapper: LineItemMapper) {}

  public async createOne(input: CreateOnePayload): Promise<LineItem> {
    const { id, price, totalPrice, quantity, bookId, cartId } = PayloadFactory.create(createOnePayloadSchema, input);

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
    const { id } = PayloadFactory.create(findOnePayloadSchema, input);

    const lineItemEntity = await this.entityManager.findOne(LineItemEntity, { where: { id } });

    if (!lineItemEntity) {
      return null;
    }

    return this.lineItemMapper.map(lineItemEntity);
  }

  public async findMany(input: FindManyPayload): Promise<LineItem[]> {
    const { pagination, cartId } = PayloadFactory.create(findManyPayloadSchema, input);

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
    } = PayloadFactory.create(updateOnePayloadSchema, input);

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
    const { id } = PayloadFactory.create(deleteOnePayloadSchema, input);

    const lineItemEntity = await this.findOne({ id });

    if (!lineItemEntity) {
      throw new LineItemNotFoundError({ id });
    }

    await this.entityManager.delete(LineItemEntity, { id });
  }
}
