import 'reflect-metadata';

import { UnitOfWorkFactory } from './factories/unitOfWorkFactory/unitOfWorkFactory';
import { UnitOfWorkFactoryImpl } from './factories/unitOfWorkFactory/unitOfWorkFactoryImpl';
import { UnitOfWorkModule } from './unitOfWorkModule';
import { unitOfWorkModuleSymbols } from './unitOfWorkModuleSymbols';
import { DependencyInjectionContainer } from '../dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../dependencyInjection/dependencyInjectionContainerFactory';
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
    expect(container.get<UnitOfWorkFactory>(unitOfWorkModuleSymbols.unitOfWorkFactory)).toBeInstanceOf(
      UnitOfWorkFactoryImpl,
    );
  });
});
