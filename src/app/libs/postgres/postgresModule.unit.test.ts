import 'reflect-metadata';
import { DataSource, EntityManager } from 'typeorm';

import { postgresSymbols } from './postgresSymbols';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('PostgresModule', () => {
  let container: DependencyInjectionContainer;

  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig)],
    });
  });

  it('declares bindings', async () => {
    expect.assertions(2);

    expect(container.get<DataSource>(postgresSymbols.dataSource)).toBeInstanceOf(DataSource);

    expect(container.get<EntityManager>(postgresSymbols.entityManager)).toBeInstanceOf(EntityManager);
  });
});
