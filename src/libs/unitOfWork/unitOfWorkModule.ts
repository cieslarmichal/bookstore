import { UnitOfWorkFactory } from './contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { UnitOfWorkFactoryImpl } from './implementations/factories/unitOfWorkFactory/unitOfWorkFactoryImpl';
import { unitOfWorkSymbols } from './unitOfWorkSymbols';
import { DependencyInjectionModule } from '../dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../dependencyInjection/implementations/dependencyInjectionContainer';

export class UnitOfWorkModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<UnitOfWorkFactory>(unitOfWorkSymbols.unitOfWorkFactory, UnitOfWorkFactoryImpl);
  }
}
