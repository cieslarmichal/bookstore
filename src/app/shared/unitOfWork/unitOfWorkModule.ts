import { LoadableModule } from '../di';
import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { UNIT_OF_WORK_FACTORY } from './unitOfWorkInjectionSymbols';
import { UnitOfWorkFactory } from './unitOfWorkFactory';

export class UnitOfWorkModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [UNIT_OF_WORK_FACTORY]: asClass(UnitOfWorkFactory, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
