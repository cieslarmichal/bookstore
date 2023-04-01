import { InventoryService } from './inventoryService';
import { CreateInventoryPayload, createInventoryPayloadSchema } from './payloads/createInventoryPayload';
import { DeleteInventoryPayload, deleteInventoryPayloadSchema } from './payloads/deleteInventoryPayload';
import { FindInventoriesPayload, findInventoriesPayloadSchema } from './payloads/findInventoriesPayload';
import { FindInventoryPayload, findInventoryPayloadSchema } from './payloads/findInventoryPayload';
import { UpdateInventoryPayload, updateInventoryPayloadSchema } from './payloads/updateInventoryPayload';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../libs/validator/validator';
import { Inventory } from '../../../domain/entities/inventory/inventory';
import { InventoryAlreadyExistsError } from '../../../infrastructure/errors/inventoryAlreadyExistsError';
import { InventoryNotFoundError } from '../../../infrastructure/errors/inventoryNotFoundError';
import { inventoryModuleSymbols } from '../../../inventoryModuleSymbols';
import { InventoryRepositoryFactory } from '../../repositories/inventoryRepository/inventoryRepositoryFactory';

@Injectable()
export class InventoryServiceImpl implements InventoryService {
  public constructor(
    @Inject(inventoryModuleSymbols.inventoryRepositoryFactory)
    private readonly inventoryRepositoryFactory: InventoryRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async createInventory(input: CreateInventoryPayload): Promise<Inventory> {
    const {
      unitOfWork,
      draft: { bookId, quantity },
    } = Validator.validate(createInventoryPayloadSchema, input);

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
    const { unitOfWork, inventoryId, bookId } = Validator.validate(findInventoryPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const inventoryRepository = this.inventoryRepositoryFactory.create(entityManager);

    let findInventoryInput = {};

    if (inventoryId) {
      findInventoryInput = { ...findInventoryInput, inventoryId };
    }

    if (bookId) {
      findInventoryInput = { ...findInventoryInput, bookId };
    }

    const inventory = await inventoryRepository.findOne(findInventoryInput);

    if (!inventory) {
      throw new InventoryNotFoundError(findInventoryInput);
    }

    return inventory;
  }

  public async findInventories(input: FindInventoriesPayload): Promise<Inventory[]> {
    const { unitOfWork, pagination } = Validator.validate(findInventoriesPayloadSchema, input);

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
    } = Validator.validate(updateInventoryPayloadSchema, input);

    this.loggerService.debug({ message: 'Updating inventory...', context: { inventoryId, quantity } });

    const entityManager = unitOfWork.getEntityManager();

    const inventoryRepository = this.inventoryRepositoryFactory.create(entityManager);

    const inventory = await inventoryRepository.updateOne({ id: inventoryId, draft: { quantity } });

    this.loggerService.info({ message: 'Inventory updated.', context: { inventoryId: inventory.id, quantity } });

    return inventory;
  }

  public async deleteInventory(input: DeleteInventoryPayload): Promise<void> {
    const { unitOfWork, inventoryId } = Validator.validate(deleteInventoryPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting inventory...', context: { inventoryId } });

    const entityManager = unitOfWork.getEntityManager();

    const inventoryRepository = this.inventoryRepositoryFactory.create(entityManager);

    await inventoryRepository.deleteOne({ id: inventoryId });

    this.loggerService.info({ message: 'Inventory deleted.', context: { inventoryId } });
  }
}
