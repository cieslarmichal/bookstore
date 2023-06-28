import 'reflect-metadata';

import { CategoryHttpController } from './api/httpControllers/categoryHttpController/categoryHttpController';
import { CategoryRepositoryFactory } from './application/repositories/categoryRepository/categoryRepositoryFactory';
import { CategoryRepositoryFactoryImpl } from './infrastructure/repositories/categoryRepository/categoryRepositoryFactoryImpl';
import { categorySymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { Application } from '../../application';

describe('CategoryModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = Application.createContainer();
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
