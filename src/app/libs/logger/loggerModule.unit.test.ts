import 'reflect-metadata';

import { LoggerService } from './contracts/services/loggerService/loggerService';
import { LoggerServiceImpl } from './implementations/services/loggerService/loggerServiceImpl';
import { LoggerModule } from './loggerModule';
import { loggerSymbols } from './loggerSymbols';
import { LoggerModuleConfigTestFactory } from './tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { DependencyInjectionContainer } from '../dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';

describe('LoggerModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new LoggerModule(loggerModuleConfig)],
    });
  });

  it('declares bindings', async () => {
    expect.assertions(1);

    expect(container.get<LoggerService>(loggerSymbols.loggerService)).toBeInstanceOf(LoggerServiceImpl);
  });
});
