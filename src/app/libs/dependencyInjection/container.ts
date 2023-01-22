/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContainer, InjectionMode, AwilixContainer } from 'awilix';

import { Module } from './module';

export async function createDependencyInjectionContainer(modules: Module[]): Promise<AwilixContainer<any>> {
  const container = createContainer({
    injectionMode: InjectionMode.CLASSIC,
  });

  for (const module of modules) {
    await module.registerSymbols(container);
  }

  return container;
}
