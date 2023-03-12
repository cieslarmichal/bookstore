import 'reflect-metadata';

import { HttpServiceFactory } from './factories/httpServiceFactory/httpServiceFactory';
import { HttpServiceFactoryImpl } from './factories/httpServiceFactory/httpServiceFactoryImpl';
import { HttpModule } from './httpModule';
import { httpModuleSymbols } from './httpModuleSymbols';
import { DependencyInjectionContainer } from '../dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../dependencyInjection/dependencyInjectionContainerFactory';

describe('HttpModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new HttpModule()],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<HttpServiceFactory>(httpModuleSymbols.httpServiceFactory)).toBeInstanceOf(
      HttpServiceFactoryImpl,
    );
  });
});
