import { LoadableModule } from '../dependencyInjection';
import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { UNIT_OF_WORK_FACTORY } from './unitOfWorkInjectionSymbols';
import { UnitOfWorkFactory } from './unitOfWorkFactory';

export class UnitOfWorkModule extends LoadableModule {
  public override async loadDependenciesIntoContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [UNIT_OF_WORK_FACTORY]: asClass(UnitOfWorkFactory, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
