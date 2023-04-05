import { WhishlistEntryRepositoryFactory } from './application/repositories/whishlistEntryRepository/whishlistEntryRepositoryFactory';
import { WhishlistService } from './application/services/whishlistService/whishlistService';
import { WhishlistServiceImpl } from './application/services/whishlistService/whishlistServiceImpl';
import { WhishlistHttpController } from './infrastructure/httpControllers/whishlistHttpController/whishlistHttpController';
import { WhishlistEntryMapper } from './infrastructure/repositories/whishlistEntryRepository/whishlistEntryMapper/whishlistEntryMapper';
import { WhishlistEntryMapperImpl } from './infrastructure/repositories/whishlistEntryRepository/whishlistEntryMapper/whishlistEntryMapperImpl';
import { WhishlistEntryRepositoryFactoryImpl } from './infrastructure/repositories/whishlistEntryRepository/whishlistEntryRepositoryFactoryImpl';
import { whishlistModuleSymbols } from './whishlistModuleSymbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class WhishlistModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<WhishlistEntryMapper>(
      whishlistModuleSymbols.whishlistEntryMapper,
      WhishlistEntryMapperImpl,
    );

    container.bindToConstructor<WhishlistEntryRepositoryFactory>(
      whishlistModuleSymbols.whishlistEntryRepositoryFactory,
      WhishlistEntryRepositoryFactoryImpl,
    );

    container.bindToConstructor<WhishlistService>(whishlistModuleSymbols.whishlistService, WhishlistServiceImpl);

    container.bindToConstructor<WhishlistHttpController>(
      whishlistModuleSymbols.whishlistHttpController,
      WhishlistHttpController,
    );
  }
}
