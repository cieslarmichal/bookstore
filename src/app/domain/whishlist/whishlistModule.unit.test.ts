import 'reflect-metadata';

import { WhishlistEntryRepositoryFactory } from './contracts/factories/whishlistEntryRepositoryFactory/whishlistEntryRepositoryFactory';
import { WhishlistEntryMapper } from './contracts/mappers/whishlistEntryMapper/whishlistEntryMapper';
import { WhishlistService } from './contracts/services/whishlistService/whishlistService';
import { WhishlistEntryRepositoryFactoryImpl } from './implementations/factories/whishlistEntryRepositoryFactory/whishlistEntryRepositoryFactoryImpl';
import { WhishlistEntryMapperImpl } from './implementations/mappers/whishlistEntryMapper/whishlistEntryMapperImpl';
import { WhishlistServiceImpl } from './implementations/services/whishlistService/whishlistServiceImpl';
import { WhishlistModule } from './whishlistModule';
import { whishlistSymbols } from './whishlistSymbols';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
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
    expect.assertions(3);

    expect(container.get<WhishlistEntryMapper>(whishlistSymbols.whishlistEntryMapper)).toBeInstanceOf(
      WhishlistEntryMapperImpl,
    );

    expect(
      container.get<WhishlistEntryRepositoryFactory>(whishlistSymbols.whishlistEntryRepositoryFactory),
    ).toBeInstanceOf(WhishlistEntryRepositoryFactoryImpl);

    expect(container.get<WhishlistService>(whishlistSymbols.whishlistService)).toBeInstanceOf(WhishlistServiceImpl);
  });
});
