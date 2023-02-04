import { AwilixContainer, asClass, Lifetime } from 'awilix';

import { customerSymbols } from './customerSymbols';
import { CustomerRepositoryFactoryImpl } from './implementations/factories/customerRepositoryFactory/customerRepositoryFactoryImpl';
import { CustomerMapperImpl } from './implementations/mappers/customerMapper/customerMapperImpl';
import { CustomerServiceImpl } from './implementations/services/customerService/customerServiceImpl';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';

export class CustomerModule implements DependencyInjectionModule {
  public async registerSymbols(container: AwilixContainer): Promise<void> {
    container.register({
      [customerSymbols.customerMapper]: asClass(CustomerMapperImpl, { lifetime: Lifetime.SINGLETON }),
      [customerSymbols.customerRepositoryFactory]: asClass(CustomerRepositoryFactoryImpl, {
        lifetime: Lifetime.SINGLETON,
      }),
      [customerSymbols.customerService]: asClass(CustomerServiceImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
