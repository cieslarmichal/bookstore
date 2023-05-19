import { CreateInventoryCommandHandler } from './createInventoryCommandHandler';
import {
  CreateInventoryCommandHandlerPayload,
  createInventoryCommandHandlerPayloadSchema,
} from './payloads/createInventoryCommandHandlerPayload';
import {
  CreateInventoryCommandHandlerResult,
  createInventoryCommandHandlerResultSchema,
} from './payloads/createInventoryCommandHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { InventoryAlreadyExistsError } from '../../../infrastructure/errors/inventoryAlreadyExistsError';
import { inventorySymbols } from '../../../symbols';
import { InventoryRepositoryFactory } from '../../repositories/inventoryRepository/inventoryRepositoryFactory';

@Injectable()
export class CreateInventoryCommandHandlerImpl implements CreateInventoryCommandHandler {
  public constructor(
    @Inject(inventorySymbols.inventoryRepositoryFactory)
    private readonly inventoryRepositoryFactory: InventoryRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: CreateInventoryCommandHandlerPayload): Promise<CreateInventoryCommandHandlerResult> {
    const {
      unitOfWork,
      draft: { bookId, quantity },
    } = Validator.validate(createInventoryCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating inventory...', context: { bookId, quantity } });

    const entityManager = unitOfWork.getEntityManager();

    const inventoryRepository = this.inventoryRepositoryFactory.create(entityManager);

    const existingInventory = await inventoryRepository.findInventory({ bookId });

    if (existingInventory) {
      throw new InventoryAlreadyExistsError({ bookId });
    }

    const inventory = await inventoryRepository.createInventory({ id: UuidGenerator.generateUuid(), bookId, quantity });

    this.loggerService.info({
      message: 'Inventory created.',
      context: { inventoryId: inventory.id, bookId, quantity },
    });

    return Validator.validate(createInventoryCommandHandlerResultSchema, { inventory });
  }
}
