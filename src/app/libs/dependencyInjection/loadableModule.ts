import { AwilixContainer } from 'awilix';

export abstract class LoadableModule {
  public abstract loadDependenciesIntoContainer(container: AwilixContainer): Promise<void>;
}
