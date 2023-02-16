import 'reflect-metadata';

import { LineItemRepositoryFactory } from './contracts/factories/lineItemRepositoryFactory/lineItemRepositoryFactory';
import { LineItemRepositoryFactoryImpl } from './implementations/factories/lineItemRepositoryFactory/lineItemRepositoryFactoryImpl';
import { LineItemModule } from './lineItemModule';
import { lineItemSymbols } from './lineItemSymbols';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('LineItemModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new LineItemModule()],
    });
  });

  it('declares bindings', async () => {
    expect.assertions(1);

    expect(container.get<LineItemRepositoryFactory>(lineItemSymbols.lineItemRepositoryFactory)).toBeInstanceOf(
      LineItemRepositoryFactoryImpl,
    );
  });
});
