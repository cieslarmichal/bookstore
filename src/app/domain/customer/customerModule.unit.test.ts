import 'reflect-metadata';

import { CustomerService } from './contracts/services/customerService/customerService';
import { CustomerModule } from './customerModule';
import { customerSymbols } from './customerSymbols';
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
    expect.assertions(1);

    expect(container.get<CustomerService>(customerSymbols.customerService)).toBeInstanceOf(CustomerServiceImpl);
  });
});