import 'reflect-metadata';

import { CategoryHttpController } from './api/httpControllers/categoryHttpController/categoryHttpController';
import { CategoryRepositoryFactory } from './application/repositories/categoryRepository/categoryRepositoryFactory';
import { CategoryModule } from './categoryModule';
import { CategoryRepositoryFactoryImpl } from './infrastructure/repositories/categoryRepository/categoryRepositoryFactoryImpl';
import { categorySymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('CategoryModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new CategoryModule()],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<CategoryRepositoryFactory>(categorySymbols.categoryRepositoryFactory)).toBeInstanceOf(
      CategoryRepositoryFactoryImpl,
    );
    expect(container.get<CategoryHttpController>(categorySymbols.categoryHttpController)).toBeInstanceOf(
      CategoryHttpController,
    );
  });
});
