import { DeleteInventoryCommandHandler } from './deleteInventoryCommandHandler';
import {
  DeleteInventoryCommandHandlerPayload,
  deleteInventoryCommandHandlerPayloadSchema,
} from './payloads/deleteInventoryCommandHandlerPayload';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { inventorySymbols } from '../../../symbols';
import { InventoryRepositoryFactory } from '../../repositories/inventoryRepository/inventoryRepositoryFactory';

@Injectable()
export class DeleteInventoryCommandHandlerImpl implements DeleteInventoryCommandHandler {
  public constructor(
    @Inject(inventorySymbols.inventoryRepositoryFactory)
    private readonly inventoryRepositoryFactory: InventoryRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: DeleteInventoryCommandHandlerPayload): Promise<void> {
    const { unitOfWork, inventoryId } = Validator.validate(deleteInventoryCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting inventory...', context: { inventoryId } });

    const entityManager = unitOfWork.getEntityManager();

    const inventoryRepository = this.inventoryRepositoryFactory.create(entityManager);

    await inventoryRepository.deleteInventory({ id: inventoryId });

    this.loggerService.info({ message: 'Inventory deleted.', context: { inventoryId } });
  }
}
