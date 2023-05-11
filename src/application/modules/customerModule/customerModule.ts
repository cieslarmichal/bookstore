import { CustomerHttpController } from './api/httpControllers/customerHttpController/customerHttpController';
import { CustomerRepositoryFactory } from './application/repositories/customerRepository/customerRepositoryFactory';
import { CustomerService } from './application/services/customerService/customerService';
import { CustomerServiceImpl } from './application/services/customerService/customerServiceImpl';
import { customerModuleSymbols } from './customerModuleSymbols';
import { CustomerMapper } from './infrastructure/repositories/customerRepository/customerMapper/customerMapper';
import { CustomerMapperImpl } from './infrastructure/repositories/customerRepository/customerMapper/customerMapperImpl';
import { CustomerRepositoryFactoryImpl } from './infrastructure/repositories/customerRepository/customerRepositoryFactoryImpl';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class CustomerModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<CustomerMapper>(customerModuleSymbols.customerMapper, CustomerMapperImpl);

    container.bindToConstructor<CustomerRepositoryFactory>(
      customerModuleSymbols.customerRepositoryFactory,
      CustomerRepositoryFactoryImpl,
    );

    container.bindToConstructor<CustomerService>(customerModuleSymbols.customerService, CustomerServiceImpl);

    container.bindToConstructor<CustomerHttpController>(
      customerModuleSymbols.customerHttpController,
      CustomerHttpController,
    );
  }
}
