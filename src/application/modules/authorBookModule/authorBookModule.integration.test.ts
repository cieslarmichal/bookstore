import 'reflect-metadata';

import { AuthorBookHttpController } from './api/httpControllers/authorBookHttpController/authorBookHttpController';
import { AuthorBookRepositoryFactory } from './application/repositories/authorBookRepository/authorBookRepositoryFactory';
import { AuthorBookRepositoryFactoryImpl } from './infrastructure/repositories/authorBookRepository/authorBookRepositoryFactoryImpl';
import { authorBookSymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { Application } from '../../application';

describe('AuthorBookModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(container.get<AuthorBookRepositoryFactory>(authorBookSymbols.authorBookRepositoryFactory)).toBeInstanceOf(
      AuthorBookRepositoryFactoryImpl,
    );

    expect(container.get<AuthorBookHttpController>(authorBookSymbols.authorBookHttpController)).toBeInstanceOf(
      AuthorBookHttpController,
    );
  });
});
