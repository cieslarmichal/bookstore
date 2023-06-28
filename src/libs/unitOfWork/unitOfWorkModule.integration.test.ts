import 'reflect-metadata';

import { UnitOfWorkFactory } from './factories/unitOfWorkFactory/unitOfWorkFactory';
import { UnitOfWorkFactoryImpl } from './factories/unitOfWorkFactory/unitOfWorkFactoryImpl';
import { unitOfWorkModuleSymbols } from './unitOfWorkModuleSymbols';
import { Application } from '../../application/application';
import { DependencyInjectionContainer } from '../dependencyInjection/dependencyInjectionContainer';

describe('UnitOfWorkModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(container.get<UnitOfWorkFactory>(unitOfWorkModuleSymbols.unitOfWorkFactory)).toBeInstanceOf(
      UnitOfWorkFactoryImpl,
    );
  });
});
