import { WhishlistEntryRepositoryFactory } from './application/repositories/whishlistEntryRepository/whishlistEntryRepositoryFactory';
import { WhishlistService } from './application/services/whishlistService/whishlistService';
import { WhishlistServiceImpl } from './application/services/whishlistService/whishlistServiceImpl';
import { WhishlistEntryMapper } from './infrastructure/repositories/whishlistEntryRepository/whishlistEntryMapper/whishlistEntryMapper';
import { WhishlistEntryMapperImpl } from './infrastructure/repositories/whishlistEntryRepository/whishlistEntryMapper/whishlistEntryMapperImpl';
import { WhishlistEntryRepositoryFactoryImpl } from './infrastructure/repositories/whishlistEntryRepository/whishlistEntryRepositoryFactoryImpl';
import { whishlistModuleSymbols } from './whishlistModuleSymbols';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class WhishlistModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<WhishlistEntryMapper>(
      whishlistModuleSymbols.whishlistEntryMapper,
      WhishlistEntryMapperImpl,
    );

    container.bindToConstructor<WhishlistEntryRepositoryFactory>(
      whishlistModuleSymbols.whishlistEntryRepositoryFactory,
      WhishlistEntryRepositoryFactoryImpl,
    );

    container.bindToConstructor<WhishlistService>(whishlistModuleSymbols.whishlistService, WhishlistServiceImpl);
  }
}
