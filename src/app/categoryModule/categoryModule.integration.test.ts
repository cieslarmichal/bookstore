import 'reflect-metadata';

import { CategoryRepositoryFactory } from './application/repositories/categoryRepository/categoryRepositoryFactory';
import { CategoryService } from './application/services/categoryService/categoryService';
import { CategoryServiceImpl } from './application/services/categoryService/categoryServiceImpl';
import { CategoryModule } from './categoryModule';
import { categoryModuleSymbols } from './categoryModuleSymbols';
import { CategoryController } from './infrastructure/httpControllers/categoryController';
import { CategoryMapper } from './infrastructure/repositories/categoryRepository/categoryMapper/categoryMapper';
import { CategoryMapperImpl } from './infrastructure/repositories/categoryRepository/categoryMapper/categoryMapperImpl';
import { CategoryRepositoryFactoryImpl } from './infrastructure/repositories/categoryRepository/categoryRepositoryFactoryImpl';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
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
    expect(container.get<CategoryMapper>(categoryModuleSymbols.categoryMapper)).toBeInstanceOf(CategoryMapperImpl);

    expect(container.get<CategoryRepositoryFactory>(categoryModuleSymbols.categoryRepositoryFactory)).toBeInstanceOf(
      CategoryRepositoryFactoryImpl,
    );

    expect(container.get<CategoryService>(categoryModuleSymbols.categoryService)).toBeInstanceOf(CategoryServiceImpl);

    expect(container.get<CategoryController>(categoryModuleSymbols.categoryController)).toBeInstanceOf(
      CategoryController,
    );
  });
});
