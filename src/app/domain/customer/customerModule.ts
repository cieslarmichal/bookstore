import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../common';
import { CUSTOMER_MAPPER, CUSTOMER_REPOSITORY_FACTORY, CUSTOMER_SERVICE } from './customerInjectionSymbols';
import { CustomerMapper } from './mappers/customerMapper';
import { CustomerRepositoryFactory } from './repositories/customerRepositoryFactory';
import { CustomerService } from './services/customerService';

export class CustomerModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [CUSTOMER_MAPPER]: asClass(CustomerMapper, { lifetime: Lifetime.SINGLETON }),
      [CUSTOMER_REPOSITORY_FACTORY]: asClass(CustomerRepositoryFactory, { lifetime: Lifetime.SINGLETON }),
      [CUSTOMER_SERVICE]: asClass(CustomerService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
