import 'reflect-metadata';

import { UnitOfWorkFactory } from './contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { UnitOfWorkFactoryImpl } from './implementations/factories/unitOfWorkFactory/unitOfWorkFactoryImpl';
import { UnitOfWorkModule } from './unitOfWorkModule';
import { unitOfWorkSymbols } from './unitOfWorkSymbols';
import { DependencyInjectionContainer } from '../dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('UnitOfWorkModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new UnitOfWorkModule()],
    });
  });

  it('declares bindings', async () => {
    expect.assertions(1);

    expect(container.get<UnitOfWorkFactory>(unitOfWorkSymbols.unitOfWorkFactory)).toBeInstanceOf(UnitOfWorkFactoryImpl);
  });
});
