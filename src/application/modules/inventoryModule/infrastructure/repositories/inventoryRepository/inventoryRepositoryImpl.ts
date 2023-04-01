import { EntityManager } from 'typeorm';

import { InventoryEntity } from './inventoryEntity/inventoryEntity';
import { InventoryMapper } from './inventoryMapper/inventoryMapper';
import { Validator } from '../../../../../../libs/validator/validator';
import { InventoryRepository } from '../../../application/repositories/inventoryRepository/inventoryRepository';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../application/repositories/inventoryRepository/payloads/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../application/repositories/inventoryRepository/payloads/deleteOnePayload';
import {
  FindManyPayload,
  findManyPayloadSchema,
} from '../../../application/repositories/inventoryRepository/payloads/findManyPayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../application/repositories/inventoryRepository/payloads/findOnePayload';
import {
  UpdateOnePayload,
  updateOnePayloadSchema,
} from '../../../application/repositories/inventoryRepository/payloads/updateOnePayload';
import { Inventory } from '../../../domain/entities/inventory/inventory';
import { InventoryNotFoundError } from '../../errors/inventoryNotFoundError';

export class InventoryRepositoryImpl implements InventoryRepository {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly inventoryMapper: InventoryMapper,
  ) {}

  public async createOne(input: CreateOnePayload): Promise<Inventory> {
    const { id, bookId, quantity } = Validator.validate(createOnePayloadSchema, input);

    const inventoryEntity = this.entityManager.create(InventoryEntity, { id, bookId, quantity });

    const savedInventoryEntity = await this.entityManager.save(inventoryEntity);

    return this.inventoryMapper.map(savedInventoryEntity);
  }

  public async findOne(input: FindOnePayload): Promise<Inventory | null> {
    const { id, bookId } = Validator.validate(findOnePayloadSchema, input);

    let findOneInput = {};

    if (id) {
      findOneInput = { ...findOneInput, id };
    }

    if (bookId) {
      findOneInput = { ...findOneInput, bookId };
    }

    const inventoryEntity = await this.entityManager.findOne(InventoryEntity, { where: { ...findOneInput } });

    if (!inventoryEntity) {
      return null;
    }

    return this.inventoryMapper.map(inventoryEntity);
  }

  public async findMany(input: FindManyPayload): Promise<Inventory[]> {
    const { pagination } = Validator.validate(findManyPayloadSchema, input);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    const inventoryEntities = await this.entityManager.find(InventoryEntity, {
      take: pagination.limit,
      skip: numberOfEnitiesToSkip,
    });

    return inventoryEntities.map((inventoryEntity) => this.inventoryMapper.map(inventoryEntity));
  }

  public async updateOne(input: UpdateOnePayload): Promise<Inventory> {
    const {
      id,
      draft: { quantity },
    } = Validator.validate(updateOnePayloadSchema, input);

    const inventoryEntity = await this.findOne({ id });

    if (!inventoryEntity) {
      throw new InventoryNotFoundError({ inventoryId: id });
    }

    await this.entityManager.update(InventoryEntity, { id }, { quantity });

    const updatedInventoryEntity = await this.findOne({ id });

    return updatedInventoryEntity as Inventory;
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = Validator.validate(deleteOnePayloadSchema, input);

    const inventoryEntity = await this.findOne({ id });

    if (!inventoryEntity) {
      throw new InventoryNotFoundError({ inventoryId: id });
    }

    await this.entityManager.delete(InventoryEntity, { id });
  }
}
