import 'reflect-metadata';

import { CustomerHttpController } from './api/httpControllers/customerHttpController/customerHttpController';
import { CustomerRepositoryFactory } from './application/repositories/customerRepository/customerRepositoryFactory';
import { CustomerModule } from './customerModule';
import { CustomerRepositoryFactoryImpl } from './infrastructure/repositories/customerRepository/customerRepositoryFactoryImpl';
import { customerSymbols } from './symbols';
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
    container = DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new CustomerModule()],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory)).toBeInstanceOf(
      CustomerRepositoryFactoryImpl,
    );

    expect(container.get<CustomerHttpController>(customerSymbols.customerHttpController)).toBeInstanceOf(
      CustomerHttpController,
    );
  });
});
