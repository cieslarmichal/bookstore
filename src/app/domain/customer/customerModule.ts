import { CustomerRepositoryFactory } from './contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { CustomerMapper } from './contracts/mappers/customerMapper/customerMapper';
import { CustomerService } from './contracts/services/customerService/customerService';
import { customerSymbols } from './customerSymbols';
import { CustomerRepositoryFactoryImpl } from './implementations/factories/customerRepositoryFactory/customerRepositoryFactoryImpl';
import { CustomerMapperImpl } from './implementations/mappers/customerMapper/customerMapperImpl';
import { CustomerServiceImpl } from './implementations/services/customerService/customerServiceImpl';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class CustomerModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<CustomerMapper>(customerSymbols.customerMapper, CustomerMapperImpl);

    container.bindToConstructor<CustomerRepositoryFactory>(
      customerSymbols.customerRepositoryFactory,
      CustomerRepositoryFactoryImpl,
    );

    container.bindToConstructor<CustomerService>(customerSymbols.customerService, CustomerServiceImpl);
  }
}
