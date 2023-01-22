/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContainer, InjectionMode, AwilixContainer } from 'awilix';

import { LoadableModule } from './loadableModule';

export async function createDependencyInjectionContainer(
  modulesConstructors: Array<new () => LoadableModule>,
): Promise<AwilixContainer<any>> {
  const container = createContainer({
    injectionMode: InjectionMode.CLASSIC,
  });

  for (const moduleConstructor of modulesConstructors) {
    const module = new moduleConstructor();

    await module.loadDependenciesIntoContainer(container);
  }

  return container;
}
