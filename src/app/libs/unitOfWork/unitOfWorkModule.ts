import { asClass, AwilixContainer, Lifetime } from 'awilix';

import { UnitOfWorkFactoryImpl } from './implementations/factories/unitOfWorkFactory/unitOfWorkFactoryImpl';
import { unitOfWorkSymbols } from './unitOfWorkSymbols';
import { DependencyInjectionModule } from '../dependencyInjection/contracts/dependencyInjectionModule';

export class UnitOfWorkModule implements DependencyInjectionModule {
  public async registerSymbols(container: AwilixContainer): Promise<void> {
    container.register({
      [unitOfWorkSymbols.unitOfWorkFactory]: asClass(UnitOfWorkFactoryImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
