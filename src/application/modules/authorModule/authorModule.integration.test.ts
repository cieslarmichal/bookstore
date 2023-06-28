import 'reflect-metadata';

import { AuthorHttpController } from './api/httpControllers/authorHttpController/authorHttpController';
import { AuthorRepositoryFactory } from './application/repositories/authorRepository/authorRepositoryFactory';
import { AuthorRepositoryFactoryImpl } from './infrastructure/repositories/authorRepository/authorRepositoryFactoryImpl';
import { authorSymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { Application } from '../../application';

describe('AuthorModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(container.get<AuthorRepositoryFactory>(authorSymbols.authorRepositoryFactory)).toBeInstanceOf(
      AuthorRepositoryFactoryImpl,
    );
    expect(container.get<AuthorHttpController>(authorSymbols.authorHttpController)).toBeInstanceOf(
      AuthorHttpController,
    );
  });
});
