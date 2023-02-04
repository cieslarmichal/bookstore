import { AwilixContainer } from 'awilix';

export interface DependencyInjectionModule {
  registerSymbols(container: AwilixContainer): Promise<void>;
}
