import {
  UpdateInventoryCommandHandlerPayload,
  updateInventoryCommandHandlerPayloadSchema,
} from './payloads/updateInventoryCommandHandlerPayload';
import {
  UpdateInventoryCommandHandlerResult,
  updateInventoryCommandHandlerResultSchema,
} from './payloads/updateInventoryCommandHandlerResult';
import { UpdateInventoryCommandHandler } from './updateInventoryCommandHandler';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { inventorySymbols } from '../../../symbols';
import { InventoryRepositoryFactory } from '../../repositories/inventoryRepository/inventoryRepositoryFactory';

@Injectable()
export class UpdateInventoryCommandHandlerImpl implements UpdateInventoryCommandHandler {
  public constructor(
    @Inject(inventorySymbols.inventoryRepositoryFactory)
    private readonly inventoryRepositoryFactory: InventoryRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: UpdateInventoryCommandHandlerPayload): Promise<UpdateInventoryCommandHandlerResult> {
    const {
      unitOfWork,
      draft: { quantity },
      inventoryId,
    } = Validator.validate(updateInventoryCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Updating inventory...', context: { inventoryId, quantity } });

    const entityManager = unitOfWork.getEntityManager();

    const inventoryRepository = this.inventoryRepositoryFactory.create(entityManager);

    const inventory = await inventoryRepository.updateInventory({ id: inventoryId, draft: { quantity } });

    this.loggerService.info({ message: 'Inventory updated.', context: { inventoryId: inventory.id, quantity } });

    return Validator.validate(updateInventoryCommandHandlerResultSchema, { inventory });
  }
}
