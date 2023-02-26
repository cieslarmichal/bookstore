import { PayloadFactory } from '../../../../../common/validator/implementations/payloadFactory';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { loggerSymbols } from '../../../../../libs/logger/loggerSymbols';
import { UuidGenerator } from '../../../../../libs/uuid/implementations/uuidGenerator';
import { InventoryRepositoryFactory } from '../../../contracts/factories/inventoryRepositoryFactory/inventoryRepositoryFactory';
import { Inventory } from '../../../contracts/inventory';
import {
  CreateInventoryPayload,
  createInventoryPayloadSchema,
} from '../../../contracts/services/inventoryService/createInventoryPayload';
import {
  DeleteInventoryPayload,
  deleteInventoryPayloadSchema,
} from '../../../contracts/services/inventoryService/deleteInventoryPayload';
import {
  FindInventoriesPayload,
  findInventoriesPayloadSchema,
} from '../../../contracts/services/inventoryService/findInventoriesPayload';
import {
  FindInventoryPayload,
  findInventoryPayloadSchema,
} from '../../../contracts/services/inventoryService/findInventoryPayload';
import { InventoryService } from '../../../contracts/services/inventoryService/inventoryService';
import {
  UpdateInventoryPayload,
  updateInventoryPayloadSchema,
} from '../../../contracts/services/inventoryService/updateInventoryPayload';
import { InventoryAlreadyExistsError } from '../../../errors/inventoryAlreadyExistsError';
import { InventoryNotFoundError } from '../../../errors/inventoryNotFoundError';
import { inventorySymbols } from '../../../inventorySymbols';

@Injectable()
export class InventoryServiceImpl implements InventoryService {
  public constructor(
    @Inject(inventorySymbols.inventoryRepositoryFactory)
    private readonly inventoryRepositoryFactory: InventoryRepositoryFactory,
    @Inject(loggerSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async createInventory(input: CreateInventoryPayload): Promise<Inventory> {
    const {
      unitOfWork,
      draft: { bookId, quantity },
    } = PayloadFactory.create(createInventoryPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating inventory...', context: { bookId, quantity } });

    const entityManager = unitOfWork.getEntityManager();

    const inventoryRepository = this.inventoryRepositoryFactory.create(entityManager);

    const existingInventory = await inventoryRepository.findOne({ bookId });

    if (existingInventory) {
      throw new InventoryAlreadyExistsError({ bookId });
    }

    const inventory = await inventoryRepository.createOne({ id: UuidGenerator.generateUuid(), bookId, quantity });

    this.loggerService.info({
      message: 'Inventory created.',
      context: { inventoryId: inventory.id, bookId, quantity },
    });

    return inventory;
  }

  public async findInventory(input: FindInventoryPayload): Promise<Inventory> {
    const { unitOfWork, inventoryId } = PayloadFactory.create(findInventoryPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const inventoryRepository = this.inventoryRepositoryFactory.create(entityManager);

    const inventory = await inventoryRepository.findOne({ id: inventoryId });

    if (!inventory) {
      throw new InventoryNotFoundError({ id: inventoryId });
    }

    return inventory;
  }

  public async findInventories(input: FindInventoriesPayload): Promise<Inventory[]> {
    const { unitOfWork, pagination } = PayloadFactory.create(findInventoriesPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const inventoryRepository = this.inventoryRepositoryFactory.create(entityManager);

    const inventories = await inventoryRepository.findMany({ pagination });

    return inventories;
  }

  public async updateInventory(input: UpdateInventoryPayload): Promise<Inventory> {
    const {
      unitOfWork,
      draft: { quantity },
      inventoryId,
    } = PayloadFactory.create(updateInventoryPayloadSchema, input);

    this.loggerService.debug({ message: 'Updating inventory...', context: { inventoryId, quantity } });

    const entityManager = unitOfWork.getEntityManager();

    const inventoryRepository = this.inventoryRepositoryFactory.create(entityManager);

    const inventory = await inventoryRepository.updateOne({ id: inventoryId, draft: { quantity } });

    this.loggerService.info({ message: 'Inventory updated.', context: { inventoryId: inventory.id, quantity } });

    return inventory;
  }

  public async deleteInventory(input: DeleteInventoryPayload): Promise<void> {
    const { unitOfWork, inventoryId } = PayloadFactory.create(deleteInventoryPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting inventory...', context: { inventoryId } });

    const entityManager = unitOfWork.getEntityManager();

    const inventoryRepository = this.inventoryRepositoryFactory.create(entityManager);

    await inventoryRepository.deleteOne({ id: inventoryId });

    this.loggerService.info({ message: 'Inventory deleted.', context: { inventoryId } });
  }
}
