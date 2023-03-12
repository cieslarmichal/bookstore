import { LineItemRepositoryFactory } from './application/repositories/lineItemRepository/lineItemRepositoryFactory';
import { LineItemMapper } from './infrastructure/repositories/lineItemRepository/lineItemMapper/lineItemMapper';
import { LineItemMapperImpl } from './infrastructure/repositories/lineItemRepository/lineItemMapper/lineItemMapperImpl';
import { LineItemRepositoryFactoryImpl } from './infrastructure/repositories/lineItemRepository/lineItemRepositoryFactoryImpl';
import { lineItemModuleSymbols } from './lineItemModuleSymbols';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule';

export class LineItemModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<LineItemMapper>(lineItemModuleSymbols.lineItemMapper, LineItemMapperImpl);

    container.bindToConstructor<LineItemRepositoryFactory>(
      lineItemModuleSymbols.lineItemRepositoryFactory,
      LineItemRepositoryFactoryImpl,
    );
  }
}
