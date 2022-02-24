import { AwilixContainer } from 'awilix';

export abstract class LoadableModule {
  public abstract loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void>;
}
