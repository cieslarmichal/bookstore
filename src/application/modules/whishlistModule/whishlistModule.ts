import { WhishlistHttpController } from './api/httpControllers/whishlistHttpController/whishlistHttpController';
import { CreateWhishlistEntryCommandHandler } from './application/commandHandlers/createWhishlistEntryCommandHandler/createWhishlistEntryCommandHandler';
import { CreateWhishlistEntryCommandHandlerImpl } from './application/commandHandlers/createWhishlistEntryCommandHandler/createWhishlistEntryCommandHandlerImpl';
import { DeleteWhishlistEntryCommandHandler } from './application/commandHandlers/deleteWhishlistEntryCommandHandler/deleteWhishlistEntryCommandHandler';
import { DeleteWhishlistEntryCommandHandlerImpl } from './application/commandHandlers/deleteWhishlistEntryCommandHandler/deleteWhishlistEntryCommandHandlerImpl';
import { FindWhishlistEntriesQueryHandler } from './application/queryHandlers/findWhishlistEntriesQueryHandler/findWhishlistEntriesQueryHandler';
import { FindWhishlistEntriesQueryHandlerImpl } from './application/queryHandlers/findWhishlistEntriesQueryHandler/findWhishlistEntriesQueryHandlerImpl';
import { FindWhishlistEntryQueryHandler } from './application/queryHandlers/findWhishlistEntryQueryHandler/findWhishlistEntryQueryHandler';
import { FindWhishlistEntryQueryHandlerImpl } from './application/queryHandlers/findWhishlistEntryQueryHandler/findWhishlistEntryQueryHandlerImpl';
import { WhishlistEntryRepositoryFactory } from './application/repositories/whishlistEntryRepository/whishlistEntryRepositoryFactory';
import { WhishlistEntryMapper } from './infrastructure/repositories/whishlistEntryRepository/whishlistEntryMapper/whishlistEntryMapper';
import { WhishlistEntryMapperImpl } from './infrastructure/repositories/whishlistEntryRepository/whishlistEntryMapper/whishlistEntryMapperImpl';
import { WhishlistEntryRepositoryFactoryImpl } from './infrastructure/repositories/whishlistEntryRepository/whishlistEntryRepositoryFactoryImpl';
import { symbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class WhishlistModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<WhishlistEntryMapper>(symbols.whishlistEntryMapper, WhishlistEntryMapperImpl);

    container.bindToConstructor<WhishlistEntryRepositoryFactory>(
      symbols.whishlistEntryRepositoryFactory,
      WhishlistEntryRepositoryFactoryImpl,
    );

    container.bindToConstructor<CreateWhishlistEntryCommandHandler>(
      symbols.createWhishlistEntryCommandHandler,
      CreateWhishlistEntryCommandHandlerImpl,
    );

    container.bindToConstructor<DeleteWhishlistEntryCommandHandler>(
      symbols.deleteWhishlistEntryCommandHandler,
      DeleteWhishlistEntryCommandHandlerImpl,
    );

    container.bindToConstructor<FindWhishlistEntryQueryHandler>(
      symbols.findWhishlistEntryQueryHandler,
      FindWhishlistEntryQueryHandlerImpl,
    );

    container.bindToConstructor<FindWhishlistEntriesQueryHandler>(
      symbols.findWhishlistEntriesQueryHandler,
      FindWhishlistEntriesQueryHandlerImpl,
    );

    container.bindToConstructor<WhishlistHttpController>(symbols.whishlistHttpController, WhishlistHttpController);
  }
}
