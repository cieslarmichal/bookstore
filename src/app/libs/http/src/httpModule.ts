import { FetchClient } from './contracts/clients/fetchClient/fetchClient';
import { HttpServiceFactory } from './contracts/factories/httpServiceFactory/httpServiceFactory';
import { httpSymbols } from './httpSymbols';
import { FetchClientImpl } from './implementations/clients/fetchClient/fetchClientImpl';
import { HttpServiceFactoryImpl } from './implementations/factories/httpServiceFactory/httpServiceFactoryImpl';
import { DependencyInjectionModule } from '../../dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../dependencyInjection/implementations/dependencyInjectionContainer';

export class HttpModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<FetchClient>(httpSymbols.fetchClient, FetchClientImpl);

    container.bindToConstructor<HttpServiceFactory>(httpSymbols.httpServiceFactory, HttpServiceFactoryImpl);
  }
}
