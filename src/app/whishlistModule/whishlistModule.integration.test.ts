import 'reflect-metadata';

import { WhishlistEntryRepositoryFactory } from './application/repositories/whishlistEntryRepository/whishlistEntryRepositoryFactory';
import { WhishlistService } from './application/services/whishlistService/whishlistService';
import { WhishlistServiceImpl } from './application/services/whishlistService/whishlistServiceImpl';
import { WhishlistController } from './infrastructure/httpControllers/whishlistController';
import { WhishlistEntryMapper } from './infrastructure/repositories/whishlistEntryRepository/whishlistEntryMapper/whishlistEntryMapper';
import { WhishlistEntryMapperImpl } from './infrastructure/repositories/whishlistEntryRepository/whishlistEntryMapper/whishlistEntryMapperImpl';
import { WhishlistEntryRepositoryFactoryImpl } from './infrastructure/repositories/whishlistEntryRepository/whishlistEntryRepositoryFactoryImpl';
import { WhishlistModule } from './whishlistModule';
import { whishlistModuleSymbols } from './whishlistModuleSymbols';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('WhishlistModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new WhishlistModule()],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<WhishlistEntryMapper>(whishlistModuleSymbols.whishlistEntryMapper)).toBeInstanceOf(
      WhishlistEntryMapperImpl,
    );

    expect(
      container.get<WhishlistEntryRepositoryFactory>(whishlistModuleSymbols.whishlistEntryRepositoryFactory),
    ).toBeInstanceOf(WhishlistEntryRepositoryFactoryImpl);

    expect(container.get<WhishlistService>(whishlistModuleSymbols.whishlistService)).toBeInstanceOf(
      WhishlistServiceImpl,
    );

    expect(container.get<WhishlistController>(whishlistModuleSymbols.whishlistController)).toBeInstanceOf(
      WhishlistController,
    );
  });
});
