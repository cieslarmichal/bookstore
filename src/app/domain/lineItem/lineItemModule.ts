import { LineItemRepositoryFactory } from './contracts/factories/lineItemRepositoryFactory/lineItemRepositoryFactory';
import { LineItemMapper } from './contracts/mappers/lineItemMapper/lineItemMapper';
import { LineItemRepositoryFactoryImpl } from './implementations/factories/lineItemRepositoryFactory/lineItemRepositoryFactoryImpl';
import { LineItemMapperImpl } from './implementations/mappers/lineItemMapper/lineItemMapperImpl';
import { lineItemSymbols } from './lineItemSymbols';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class LineItemModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<LineItemMapper>(lineItemSymbols.lineItemMapper, LineItemMapperImpl);

    container.bindToConstructor<LineItemRepositoryFactory>(
      lineItemSymbols.lineItemRepositoryFactory,
      LineItemRepositoryFactoryImpl,
    );
  }
}
