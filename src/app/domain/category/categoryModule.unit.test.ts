import 'reflect-metadata';

import { CategoryModule } from './categoryModule';
import { categorySymbols } from './categorySymbols';
import { CategoryRepositoryFactory } from './contracts/factories/categoryRepositoryFactory/categoryRepositoryFactory';
import { CategoryMapper } from './contracts/mappers/categoryMapper/categoryMapper';
import { CategoryService } from './contracts/services/categoryService/categoryService';
import { CategoryRepositoryFactoryImpl } from './implementations/factories/categoryRepositoryFactory/categoryRepositoryFactoryImpl';
import { CategoryMapperImpl } from './implementations/mappers/categoryMapper/categoryMapperImpl';
import { CategoryServiceImpl } from './implementations/services/categoryService/categoryServiceImpl';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

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
    expect.assertions(3);

    expect(container.get<CategoryMapper>(categorySymbols.categoryMapper)).toBeInstanceOf(CategoryMapperImpl);

    expect(container.get<CategoryRepositoryFactory>(categorySymbols.categoryRepositoryFactory)).toBeInstanceOf(
      CategoryRepositoryFactoryImpl,
    );

    expect(container.get<CategoryService>(categorySymbols.categoryService)).toBeInstanceOf(CategoryServiceImpl);
  });
});
