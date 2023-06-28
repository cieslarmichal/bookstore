import 'reflect-metadata';

import { loggerModuleSymbols } from './loggerModuleSymbols';
import { LoggerService } from './services/loggerService/loggerService';
import { LoggerServiceImpl } from './services/loggerService/loggerServiceImpl';
import { Application } from '../../application/application';
import { DependencyInjectionContainer } from '../dependencyInjection/dependencyInjectionContainer';

describe('LoggerModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(container.get<LoggerService>(loggerModuleSymbols.loggerService)).toBeInstanceOf(LoggerServiceImpl);
  });
});
