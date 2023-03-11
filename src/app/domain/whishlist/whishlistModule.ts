import { WhishlistEntryRepositoryFactory } from './contracts/factories/whishlistEntryRepositoryFactory/whishlistEntryRepositoryFactory';
import { WhishlistEntryMapper } from './contracts/mappers/whishlistEntryMapper/whishlistEntryMapper';
import { WhishlistService } from './contracts/services/whishlistService/whishlistService';
import { WhishlistEntryRepositoryFactoryImpl } from './implementations/factories/whishlistEntryRepositoryFactory/whishlistEntryRepositoryFactoryImpl';
import { WhishlistEntryMapperImpl } from './implementations/mappers/whishlistEntryMapper/whishlistEntryMapperImpl';
import { WhishlistServiceImpl } from './implementations/services/whishlistService/whishlistServiceImpl';
import { whishlistSymbols } from './whishlistSymbols';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class WhishlistModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<WhishlistEntryMapper>(whishlistSymbols.whishlistEntryMapper, WhishlistEntryMapperImpl);

    container.bindToConstructor<WhishlistEntryRepositoryFactory>(
      whishlistSymbols.whishlistEntryRepositoryFactory,
      WhishlistEntryRepositoryFactoryImpl,
    );

    container.bindToConstructor<WhishlistService>(whishlistSymbols.whishlistService, WhishlistServiceImpl);
  }
}
