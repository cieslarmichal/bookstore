import 'reflect-metadata';

import { WhishlistHttpController } from './api/httpControllers/whishlistHttpController/whishlistHttpController';
import { WhishlistEntryRepositoryFactory } from './application/repositories/whishlistEntryRepository/whishlistEntryRepositoryFactory';
import { WhishlistEntryRepositoryFactoryImpl } from './infrastructure/repositories/whishlistEntryRepository/whishlistEntryRepositoryFactoryImpl';
import { whishlistSymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { Application } from '../../application';

describe('WhishlistModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(
      container.get<WhishlistEntryRepositoryFactory>(whishlistSymbols.whishlistEntryRepositoryFactory),
    ).toBeInstanceOf(WhishlistEntryRepositoryFactoryImpl);

    expect(container.get<WhishlistHttpController>(whishlistSymbols.whishlistHttpController)).toBeInstanceOf(
      WhishlistHttpController,
    );
  });
});
