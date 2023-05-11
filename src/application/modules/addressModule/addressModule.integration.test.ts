import 'reflect-metadata';

import { AddressModule } from './addressModule';
import { AddressHttpController } from './api/httpControllers/addressHttpController/addressHttpController';
import { AddressRepositoryFactory } from './application/repositories/addressRepository/addressRepositoryFactory';
import { AddressRepositoryFactoryImpl } from './infrastructure/repositories/addressRepository/addressRepositoryFactoryImpl';
import { addressSymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('AddressModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new AddressModule()],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<AddressHttpController>(addressSymbols.addressHttpController)).toBeInstanceOf(
      AddressHttpController,
    );

    expect(container.get<AddressRepositoryFactory>(addressSymbols.addressRepositoryFactory)).toBeInstanceOf(
      AddressRepositoryFactoryImpl,
    );
  });
});
