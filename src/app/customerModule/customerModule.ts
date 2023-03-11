import { CustomerRepositoryFactory } from './application/repositories/customerRepository/customerRepositoryFactory';
import { CustomerService } from './application/services/customerService/customerService';
import { CustomerServiceImpl } from './application/services/customerService/customerServiceImpl';
import { customerModuleSymbols } from './customerModuleSymbols';
import { CustomerMapper } from './infrastructure/repositories/customerRepository/customerMapper/customerMapper';
import { CustomerMapperImpl } from './infrastructure/repositories/customerRepository/customerMapper/customerMapperImpl';
import { CustomerRepositoryFactoryImpl } from './infrastructure/repositories/customerRepository/customerRepositoryFactoryImpl';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class CustomerModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<CustomerMapper>(customerModuleSymbols.customerMapper, CustomerMapperImpl);

    container.bindToConstructor<CustomerRepositoryFactory>(
      customerModuleSymbols.customerRepositoryFactory,
      CustomerRepositoryFactoryImpl,
    );

    container.bindToConstructor<CustomerService>(customerModuleSymbols.customerService, CustomerServiceImpl);
  }
}
