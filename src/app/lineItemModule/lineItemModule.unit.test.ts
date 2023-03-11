import 'reflect-metadata';

import { LineItemRepositoryFactory } from './application/repositories/lineItemRepository/lineItemRepositoryFactory';
import { LineItemMapper } from './infrastructure/repositories/lineItemRepository/lineItemMapper/lineItemMapper';
import { LineItemMapperImpl } from './infrastructure/repositories/lineItemRepository/lineItemMapper/lineItemMapperImpl';
import { LineItemRepositoryFactoryImpl } from './infrastructure/repositories/lineItemRepository/lineItemRepositoryFactoryImpl';
import { LineItemModule } from './lineItemModule';
import { lineItemModuleSymbols } from './lineItemModuleSymbols';
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
    expect.assertions(2);

    expect(container.get<LineItemMapper>(lineItemModuleSymbols.lineItemMapper)).toBeInstanceOf(LineItemMapperImpl);

    expect(container.get<LineItemRepositoryFactory>(lineItemModuleSymbols.lineItemRepositoryFactory)).toBeInstanceOf(
      LineItemRepositoryFactoryImpl,
    );
  });
});
