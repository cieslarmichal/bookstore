import { UnitOfWorkFactory } from './factories/unitOfWorkFactory/unitOfWorkFactory';
import { UnitOfWorkFactoryImpl } from './factories/unitOfWorkFactory/unitOfWorkFactoryImpl';
import { unitOfWorkModuleSymbols } from './unitOfWorkModuleSymbols';
import { DependencyInjectionContainer } from '../dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../dependencyInjection/dependencyInjectionModule';

export class UnitOfWorkModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<UnitOfWorkFactory>(unitOfWorkModuleSymbols.unitOfWorkFactory, UnitOfWorkFactoryImpl);
  }
}
