import { EntityManager } from 'typeorm';

import { PayloadFactory } from '../../../../../common/validator/implementations/payloadFactory';
import { Inventory } from '../../../contracts/inventory';
import { InventoryEntity } from '../../../contracts/inventoryEntity';
import { InventoryMapper } from '../../../contracts/mappers/inventoryMapper/inventoryMapper';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../contracts/repositories/inventoryRepository/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../contracts/repositories/inventoryRepository/deleteOnePayload';
import {
  FindManyPayload,
  findManyPayloadSchema,
} from '../../../contracts/repositories/inventoryRepository/findManyPayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../contracts/repositories/inventoryRepository/findOnePayload';
import { InventoryRepository } from '../../../contracts/repositories/inventoryRepository/inventoryRepository';
import {
  UpdateOnePayload,
  updateOnePayloadSchema,
} from '../../../contracts/repositories/inventoryRepository/updateOnePayload';
import { InventoryNotFoundError } from '../../../errors/inventoryNotFoundError';

export class InventoryRepositoryImpl implements InventoryRepository {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly inventoryMapper: InventoryMapper,
  ) {}

  public async createOne(input: CreateOnePayload): Promise<Inventory> {
    const { id, bookId, quantity } = PayloadFactory.create(createOnePayloadSchema, input);

    const inventoryEntity = this.entityManager.create(InventoryEntity, { id, bookId, quantity });

    const savedInventoryEntity = await this.entityManager.save(inventoryEntity);

    return this.inventoryMapper.map(savedInventoryEntity);
  }

  public async findOne(input: FindOnePayload): Promise<Inventory | null> {
    const { id, bookId } = PayloadFactory.create(findOnePayloadSchema, input);

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
    const { pagination } = PayloadFactory.create(findManyPayloadSchema, input);

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
    } = PayloadFactory.create(updateOnePayloadSchema, input);

    const inventoryEntity = await this.findOne({ id });

    if (!inventoryEntity) {
      throw new InventoryNotFoundError({ inventoryId: id });
    }

    await this.entityManager.update(InventoryEntity, { id }, { quantity });

    const updatedInventoryEntity = await this.findOne({ id });

    return updatedInventoryEntity as Inventory;
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = PayloadFactory.create(deleteOnePayloadSchema, input);

    const inventoryEntity = await this.findOne({ id });

    if (!inventoryEntity) {
      throw new InventoryNotFoundError({ inventoryId: id });
    }

    await this.entityManager.delete(InventoryEntity, { id });
  }
}
