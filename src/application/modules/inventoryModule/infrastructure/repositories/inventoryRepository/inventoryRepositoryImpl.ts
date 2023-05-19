import { EntityManager, FindManyOptions } from 'typeorm';

import { InventoryEntity } from './inventoryEntity/inventoryEntity';
import { InventoryMapper } from './inventoryMapper/inventoryMapper';
import { Validator } from '../../../../../../libs/validator/validator';
import { InventoryRepository } from '../../../application/repositories/inventoryRepository/inventoryRepository';
import {
  CreateInventoryPayload,
  createInventoryPayloadSchema,
} from '../../../application/repositories/inventoryRepository/payloads/createInventoryPayload';
import {
  DeleteInventoryPayload,
  deleteInventoryPayloadSchema,
} from '../../../application/repositories/inventoryRepository/payloads/deleteInventoryPayload';
import {
  FindInventoriesPayload,
  findInventoriesPayloadSchema,
} from '../../../application/repositories/inventoryRepository/payloads/findInventoriesPayload';
import {
  FindInventoryPayload,
  findInventoryPayloadSchema,
} from '../../../application/repositories/inventoryRepository/payloads/findInventoryPayload';
import {
  UpdateInventoryPayload,
  updateInventoryPayloadSchema,
} from '../../../application/repositories/inventoryRepository/payloads/updateInventoryPayload';
import { Inventory } from '../../../domain/entities/inventory/inventory';
import { InventoryNotFoundError } from '../../errors/inventoryNotFoundError';

export class InventoryRepositoryImpl implements InventoryRepository {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly inventoryMapper: InventoryMapper,
  ) {}

  public async createInventory(input: CreateInventoryPayload): Promise<Inventory> {
    const { id, bookId, quantity } = Validator.validate(createInventoryPayloadSchema, input);

    const inventoryEntity = this.entityManager.create(InventoryEntity, { id, bookId, quantity });

    const savedInventoryEntity = await this.entityManager.save(inventoryEntity);

    return this.inventoryMapper.map(savedInventoryEntity);
  }

  public async findInventory(input: FindInventoryPayload): Promise<Inventory | null> {
    const { id, bookId } = Validator.validate(findInventoryPayloadSchema, input);

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

  public async findInventories(input: FindInventoriesPayload): Promise<Inventory[]> {
    const { pagination, bookId } = Validator.validate(findInventoriesPayloadSchema, input);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    let findInput: FindManyOptions<InventoryEntity> = {
      take: pagination.limit,
      skip: numberOfEnitiesToSkip,
    };

    if (bookId) {
      findInput = { ...findInput, where: { bookId } };
    }

    const inventoryEntities = await this.entityManager.find(InventoryEntity, findInput);

    return inventoryEntities.map((inventoryEntity) => this.inventoryMapper.map(inventoryEntity));
  }

  public async updateInventory(input: UpdateInventoryPayload): Promise<Inventory> {
    const {
      id,
      draft: { quantity },
    } = Validator.validate(updateInventoryPayloadSchema, input);

    const inventoryEntity = await this.findInventory({ id });

    if (!inventoryEntity) {
      throw new InventoryNotFoundError({ inventoryId: id });
    }

    await this.entityManager.update(InventoryEntity, { id }, { quantity });

    const updatedInventoryEntity = await this.findInventory({ id });

    return updatedInventoryEntity as Inventory;
  }

  public async deleteInventory(input: DeleteInventoryPayload): Promise<void> {
    const { id } = Validator.validate(deleteInventoryPayloadSchema, input);

    const inventoryEntity = await this.findInventory({ id });

    if (!inventoryEntity) {
      throw new InventoryNotFoundError({ inventoryId: id });
    }

    await this.entityManager.delete(InventoryEntity, { id });
  }
}
