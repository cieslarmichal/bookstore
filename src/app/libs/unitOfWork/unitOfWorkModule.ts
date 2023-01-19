import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../dependencyInjection/loadableModule';
import { UnitOfWorkFactory } from './unitOfWorkFactory';
import { unitOfWorkSymbols } from './unitOfWorkSymbols';

export class UnitOfWorkModule extends LoadableModule {
  public override async loadDependenciesIntoContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [unitOfWorkSymbols.unitOfWorkFactory]: asClass(UnitOfWorkFactory, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
