import 'reflect-metadata';

import { CustomerHttpController } from './api/httpControllers/customerHttpController/customerHttpController';
import { CustomerRepositoryFactory } from './application/repositories/customerRepository/customerRepositoryFactory';
import { CustomerService } from './application/services/customerService/customerService';
import { CustomerServiceImpl } from './application/services/customerService/customerServiceImpl';
import { CustomerModule } from './customerModule';
import { customerModuleSymbols } from './customerModuleSymbols';
import { CustomerMapper } from './infrastructure/repositories/customerRepository/customerMapper/customerMapper';
import { CustomerMapperImpl } from './infrastructure/repositories/customerRepository/customerMapper/customerMapperImpl';
import { CustomerRepositoryFactoryImpl } from './infrastructure/repositories/customerRepository/customerRepositoryFactoryImpl';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('CustomerModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new CustomerModule()],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<CustomerMapper>(customerModuleSymbols.customerMapper)).toBeInstanceOf(CustomerMapperImpl);

    expect(container.get<CustomerRepositoryFactory>(customerModuleSymbols.customerRepositoryFactory)).toBeInstanceOf(
      CustomerRepositoryFactoryImpl,
    );

    expect(container.get<CustomerService>(customerModuleSymbols.customerService)).toBeInstanceOf(CustomerServiceImpl);

    expect(container.get<CustomerHttpController>(customerModuleSymbols.customerHttpController)).toBeInstanceOf(
      CustomerHttpController,
    );
  });
});
