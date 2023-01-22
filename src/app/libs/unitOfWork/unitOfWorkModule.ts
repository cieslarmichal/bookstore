import { asClass, AwilixContainer, Lifetime } from 'awilix';

import { UnitOfWorkFactory } from './unitOfWorkFactory';
import { unitOfWorkSymbols } from './unitOfWorkSymbols';
import { LoadableModule } from '../dependencyInjection/loadableModule';

export class UnitOfWorkModule extends LoadableModule {
  public override async loadDependenciesIntoContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [unitOfWorkSymbols.unitOfWorkFactory]: asClass(UnitOfWorkFactory, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
