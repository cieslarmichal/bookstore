import 'reflect-metadata';

import { HttpServiceFactory } from './factories/httpServiceFactory/httpServiceFactory';
import { HttpServiceFactoryImpl } from './factories/httpServiceFactory/httpServiceFactoryImpl';
import { httpModuleSymbols } from './httpModuleSymbols';
import { Application } from '../../application/application';
import { DependencyInjectionContainer } from '../dependencyInjection/dependencyInjectionContainer';

describe('HttpModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(container.get<HttpServiceFactory>(httpModuleSymbols.httpServiceFactory)).toBeInstanceOf(
      HttpServiceFactoryImpl,
    );
  });
});
