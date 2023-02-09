import 'reflect-metadata';

import { CategoryModule } from './categoryModule';
import { categorySymbols } from './categorySymbols';
import { CategoryService } from './contracts/services/categoryService/categoryService';
import { CategoryServiceImpl } from './implementations/services/categoryService/categoryServiceImpl';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('CategoryModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new CategoryModule()],
    });
  });

  it('declares bindings', async () => {
    expect.assertions(1);

    expect(container.get<CategoryService>(categorySymbols.categoryService)).toBeInstanceOf(CategoryServiceImpl);
  });
});
