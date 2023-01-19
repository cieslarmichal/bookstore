import { createContainer, InjectionMode } from 'awilix';
import { LoadableModule } from './loadableModule';

export async function createDIContainer(ModuleConstructors: Array<new () => LoadableModule>) {
  const container = createContainer({
    injectionMode: InjectionMode.CLASSIC,
  });

  for (const ModuleConstructor of ModuleConstructors) {
    const module = new ModuleConstructor();

    await module.loadDependenciesIntoDIContainer(container);
  }

  return container;
}
