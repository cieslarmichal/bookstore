import { AwilixContainer, asClass, Lifetime } from 'awilix';
import { LoadableModule } from '../../libs/dependencyInjection/loadableModule';
import { customerSymbols } from './customerSymbols';
import { CustomerRepositoryFactoryImpl } from './implementations/factories/customerRepositoryFactory/customerRepositoryFactoryImpl';
import { CustomerMapperImpl } from './implementations/mappers/customerMapper/customerMapperImpl';
import { CustomerServiceImpl } from './implementations/services/customerService/customerServiceImpl';

export class CustomerModule extends LoadableModule {
  public override async loadDependenciesIntoContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [customerSymbols.customerMapper]: asClass(CustomerMapperImpl, { lifetime: Lifetime.SINGLETON }),
      [customerSymbols.customerRepositoryFactory]: asClass(CustomerRepositoryFactoryImpl, {
        lifetime: Lifetime.SINGLETON,
      }),
      [customerSymbols.customerService]: asClass(CustomerServiceImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
