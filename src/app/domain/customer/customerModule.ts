import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../shared';
import { CUSTOMER_MAPPER, CUSTOMER_REPOSITORY, CUSTOMER_SERVICE } from './customerInjectionSymbols';
import { CustomerMapper } from './mappers/customerMapper';
import { CustomerRepository } from './repositories/customerRepository';
import { CustomerService } from './services/customerService';

export class CustomerModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [CUSTOMER_MAPPER]: asClass(CustomerMapper, { lifetime: Lifetime.SINGLETON }),
      [CUSTOMER_REPOSITORY]: asClass(CustomerRepository, { lifetime: Lifetime.SINGLETON }),
      [CUSTOMER_SERVICE]: asClass(CustomerService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
