import 'reflect-metadata';

import { LoggerModule } from './loggerModule';
import { loggerModuleSymbols } from './loggerModuleSymbols';
import { LoggerService } from './services/loggerService/loggerService';
import { LoggerServiceImpl } from './services/loggerService/loggerServiceImpl';
import { LoggerModuleConfigTestFactory } from './tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { DependencyInjectionContainer } from '../dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../dependencyInjection/dependencyInjectionContainerFactory';

describe('LoggerModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new LoggerModule(loggerModuleConfig)],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<LoggerService>(loggerModuleSymbols.loggerService)).toBeInstanceOf(LoggerServiceImpl);
  });
});
