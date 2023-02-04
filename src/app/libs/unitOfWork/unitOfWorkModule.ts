import { asClass, AwilixContainer, Lifetime } from 'awilix';

import { UnitOfWorkFactory } from './unitOfWorkFactory';
import { unitOfWorkSymbols } from './unitOfWorkSymbols';
import { DependencyInjectionModule } from '../dependencyInjection/contracts/dependencyInjectionModule';

export class UnitOfWorkModule implements DependencyInjectionModule {
  public async registerSymbols(container: AwilixContainer): Promise<void> {
    container.register({
      [unitOfWorkSymbols.unitOfWorkFactory]: asClass(UnitOfWorkFactory, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
