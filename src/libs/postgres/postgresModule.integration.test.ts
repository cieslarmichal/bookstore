import 'reflect-metadata';

import { DataSource, EntityManager } from 'typeorm';

import { postgresModuleSymbols } from './postgresModuleSymbols';
import { Application } from '../../application/application';
import { DependencyInjectionContainer } from '../dependencyInjection/dependencyInjectionContainer';

describe('PostgresModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(container.get<DataSource>(postgresModuleSymbols.dataSource)).toBeInstanceOf(DataSource);

    expect(container.get<EntityManager>(postgresModuleSymbols.entityManager)).toBeInstanceOf(EntityManager);
  });
});
