import 'reflect-metadata';
import { DataSource, EntityManager } from 'typeorm';

import { PostgresModule } from './postgresModule';
import { postgresModuleSymbols } from './postgresModuleSymbols';
import { PostgresModuleConfigTestFactory } from './tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { DependencyInjectionContainer } from '../dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../dependencyInjection/dependencyInjectionContainerFactory';

describe('PostgresModule', () => {
  let container: DependencyInjectionContainer;

  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig)],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<DataSource>(postgresModuleSymbols.dataSource)).toBeInstanceOf(DataSource);

    expect(container.get<EntityManager>(postgresModuleSymbols.entityManager)).toBeInstanceOf(EntityManager);
  });
});
