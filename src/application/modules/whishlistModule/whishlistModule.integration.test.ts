import 'reflect-metadata';

import { WhishlistHttpController } from './api/httpControllers/whishlistHttpController/whishlistHttpController';
import { WhishlistEntryRepositoryFactory } from './application/repositories/whishlistEntryRepository/whishlistEntryRepositoryFactory';
import { WhishlistEntryRepositoryFactoryImpl } from './infrastructure/repositories/whishlistEntryRepository/whishlistEntryRepositoryFactoryImpl';
import { whishlistSymbols } from './symbols';
import { WhishlistModule } from './whishlistModule';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('WhishlistModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new WhishlistModule()],
    });
  });

  it('declares bindings', async () => {
    expect(
      container.get<WhishlistEntryRepositoryFactory>(whishlistSymbols.whishlistEntryRepositoryFactory),
    ).toBeInstanceOf(WhishlistEntryRepositoryFactoryImpl);

    expect(container.get<WhishlistHttpController>(whishlistSymbols.whishlistHttpController)).toBeInstanceOf(
      WhishlistHttpController,
    );
  });
});
