import 'reflect-metadata';

import { CustomerRepositoryFactory } from './contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { CustomerMapper } from './contracts/mappers/customerMapper/customerMapper';
import { CustomerService } from './contracts/services/customerService/customerService';
import { CustomerModule } from './customerModule';
import { customerSymbols } from './customerSymbols';
import { CustomerRepositoryFactoryImpl } from './implementations/factories/customerRepositoryFactory/customerRepositoryFactoryImpl';
import { CustomerMapperImpl } from './implementations/mappers/customerMapper/customerMapperImpl';
import { CustomerServiceImpl } from './implementations/services/customerService/customerServiceImpl';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

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
    expect.assertions(3);

    expect(container.get<CustomerMapper>(customerSymbols.customerMapper)).toBeInstanceOf(CustomerMapperImpl);

    expect(container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory)).toBeInstanceOf(
      CustomerRepositoryFactoryImpl,
    );

    expect(container.get<CustomerService>(customerSymbols.customerService)).toBeInstanceOf(CustomerServiceImpl);
  });
});
