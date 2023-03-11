import 'reflect-metadata';

import { HttpServiceFactory } from './contracts/factories/httpServiceFactory/httpServiceFactory';
import { HttpModule } from './httpModule';
import { httpSymbols } from './httpSymbols';
import { HttpServiceFactoryImpl } from './implementations/factories/httpServiceFactory/httpServiceFactoryImpl';
import { DependencyInjectionContainer } from '../../dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';

describe('HttpModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new HttpModule()],
    });
  });

  it('declares bindings', async () => {
    expect.assertions(1);

    expect(container.get<HttpServiceFactory>(httpSymbols.httpServiceFactory)).toBeInstanceOf(HttpServiceFactoryImpl);
  });
});
