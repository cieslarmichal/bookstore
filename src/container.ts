import { createContainer, InjectionMode } from 'awilix';
import { LoadableModule } from './app/shared';

export async function createDIContainer(modules: Array<LoadableModule>) {
  const container = createContainer({
    injectionMode: InjectionMode.CLASSIC,
  });

  for (const module of modules) {
    await module.loadDependenciesIntoDIContainer(container);
  }

  return container;
}
