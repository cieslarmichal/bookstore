import { FetchClient } from './clients/fetchClient/fetchClient';
import { FetchClientImpl } from './clients/fetchClient/fetchClientImpl';
import { HttpServiceFactory } from './factories/httpServiceFactory/httpServiceFactory';
import { HttpServiceFactoryImpl } from './factories/httpServiceFactory/httpServiceFactoryImpl';
import { httpModuleSymbols } from './httpModuleSymbols';
import { DependencyInjectionContainer } from '../dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../dependencyInjection/dependencyInjectionModule';

export class HttpModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<FetchClient>(httpModuleSymbols.fetchClient, FetchClientImpl);

    container.bindToConstructor<HttpServiceFactory>(httpModuleSymbols.httpServiceFactory, HttpServiceFactoryImpl);
  }
}
