/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContainer, InjectionMode, AwilixContainer } from 'awilix';

import { DependencyInjectionModule } from '../../../contracts/dependencyInjectionModule';

export class DependencyInjectionContainerFactory {
  public static async create(modules: DependencyInjectionModule[]): Promise<AwilixContainer<any>> {
    const container = createContainer({
      injectionMode: InjectionMode.CLASSIC,
    });

    for (const module of modules) {
      await module.registerSymbols(container);
    }

    return container;
  }
}
