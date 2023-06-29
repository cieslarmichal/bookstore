import { EntityManager } from 'typeorm';

import { LineItemEntity } from './lineItemEntity/lineItemEntity';
import { LineItemMapper } from './lineItemMapper/lineItemMapper';
import { Validator } from '../../../../../../libs/validator/validator';
import { LineItem } from '../../../../orderModule/domain/entities/lineItem/lineItem';
import { LineItemNotFoundError } from '../../../application/errors/lineItemNotFoundError';
import { LineItemRepository } from '../../../application/repositories/lineItemRepository/lineItemRepository';
import {
  CreateLineItemPayload,
  createLineItemPayloadSchema,
} from '../../../application/repositories/lineItemRepository/payloads/createLineItemPayload';
import {
  DeleteLineItemPayload,
  deleteLineItemPayloadSchema,
} from '../../../application/repositories/lineItemRepository/payloads/deleteLineItemPayload';
import {
  FindLineItemPayload,
  findLineItemPayloadSchema,
} from '../../../application/repositories/lineItemRepository/payloads/findLineItemPayload';
import {
  FindLineItemsPayload,
  findLineItemsPayloadSchema,
} from '../../../application/repositories/lineItemRepository/payloads/findLineItemsPayload';
import {
  UpdateLineItemPayload,
  updateLineItemPayloadSchema,
} from '../../../application/repositories/lineItemRepository/payloads/updateLineItemPayload';

export class LineItemRepositoryImpl implements LineItemRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly lineItemMapper: LineItemMapper) {}

  public async createLineItem(input: CreateLineItemPayload): Promise<LineItem> {
    const { id, price, totalPrice, quantity, bookId, cartId } = Validator.validate(createLineItemPayloadSchema, input);

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

  public async findLineItem(input: FindLineItemPayload): Promise<LineItem | null> {
    const { id } = Validator.validate(findLineItemPayloadSchema, input);

    const lineItemEntity = await this.entityManager.findOne(LineItemEntity, { where: { id } });

    if (!lineItemEntity) {
      return null;
    }

    return this.lineItemMapper.map(lineItemEntity);
  }

  public async findLineItems(input: FindLineItemsPayload): Promise<LineItem[]> {
    const { pagination, cartId } = Validator.validate(findLineItemsPayloadSchema, input);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    const lineItemesEntities = await this.entityManager.find(LineItemEntity, {
      skip: numberOfEnitiesToSkip,
      take: pagination.limit,
      where: { cartId },
    });

    return lineItemesEntities.map((lineItem) => this.lineItemMapper.map(lineItem));
  }

  public async updateLineItem(input: UpdateLineItemPayload): Promise<LineItem> {
    const {
      id,
      draft: { price, totalPrice, quantity },
    } = Validator.validate(updateLineItemPayloadSchema, input);

    const lineItemEntity = await this.findLineItem({ id });

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

    const updatedLineItemEntity = await this.findLineItem({ id });

    return updatedLineItemEntity as LineItem;
  }

  public async deleteLineItem(input: DeleteLineItemPayload): Promise<void> {
    const { id } = Validator.validate(deleteLineItemPayloadSchema, input);

    const lineItemEntity = await this.findLineItem({ id });

    if (!lineItemEntity) {
      throw new LineItemNotFoundError({ id });
    }

    await this.entityManager.delete(LineItemEntity, { id });
  }
}
