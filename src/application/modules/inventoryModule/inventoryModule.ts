import { InventoryHttpController } from './api/httpControllers/inventoryHttpController/inventoryHttpController';
import { CreateInventoryCommandHandler } from './application/commandHandlers/createInventoryCommandHandler/createInventoryCommandHandler';
import { CreateInventoryCommandHandlerImpl } from './application/commandHandlers/createInventoryCommandHandler/createInventoryCommandHandlerImpl';
import { DeleteInventoryCommandHandler } from './application/commandHandlers/deleteInventoryCommandHandler/deleteInventoryCommandHandler';
import { DeleteInventoryCommandHandlerImpl } from './application/commandHandlers/deleteInventoryCommandHandler/deleteInventoryCommandHandlerImpl';
import { UpdateInventoryCommandHandler } from './application/commandHandlers/updateInventoryCommandHandler/updateInventoryCommandHandler';
import { UpdateInventoryCommandHandlerImpl } from './application/commandHandlers/updateInventoryCommandHandler/updateInventoryCommandHandlerImpl';
import { FindInventoriesQueryHandler } from './application/queryHandlers/findInventoriesQueryHandler/findInventoriesQueryHandler';
import { FindInventoriesQueryHandlerImpl } from './application/queryHandlers/findInventoriesQueryHandler/findInventoriesQueryHandlerImpl';
import { FindInventoryQueryHandler } from './application/queryHandlers/findInventoryQueryHandler/findInventoryQueryHandler';
import { FindInventoryQueryHandlerImpl } from './application/queryHandlers/findInventoryQueryHandler/findInventoryQueryHandlerImpl';
import { InventoryRepositoryFactory } from './application/repositories/inventoryRepository/inventoryRepositoryFactory';
import { InventoryMapper } from './infrastructure/repositories/inventoryRepository/inventoryMapper/inventoryMapper';
import { InventoryMapperImpl } from './infrastructure/repositories/inventoryRepository/inventoryMapper/inventoryMapperImpl';
import { InventoryRepositoryFactoryImpl } from './infrastructure/repositories/inventoryRepository/inventoryRepositoryFactoryImpl';
import { symbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class InventoryModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<InventoryMapper>(symbols.inventoryMapper, InventoryMapperImpl);

    container.bindToConstructor<InventoryRepositoryFactory>(
      symbols.inventoryRepositoryFactory,
      InventoryRepositoryFactoryImpl,
    );

    container.bindToConstructor<CreateInventoryCommandHandler>(
      symbols.createInventoryCommandHandler,
      CreateInventoryCommandHandlerImpl,
    );

    container.bindToConstructor<UpdateInventoryCommandHandler>(
      symbols.updateInventoryCommandHandler,
      UpdateInventoryCommandHandlerImpl,
    );

    container.bindToConstructor<DeleteInventoryCommandHandler>(
      symbols.deleteInventoryCommandHandler,
      DeleteInventoryCommandHandlerImpl,
    );

    container.bindToConstructor<FindInventoryQueryHandler>(
      symbols.findInventoryQueryHandler,
      FindInventoryQueryHandlerImpl,
    );

    container.bindToConstructor<FindInventoriesQueryHandler>(
      symbols.findInventoriesQueryHandler,
      FindInventoriesQueryHandlerImpl,
    );

    container.bindToConstructor<InventoryHttpController>(symbols.inventoryHttpController, InventoryHttpController);
  }
}
