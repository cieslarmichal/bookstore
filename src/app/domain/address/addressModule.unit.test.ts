import 'reflect-metadata';

import { AddressModule } from './addressModule';
import { addressSymbols } from './addressSymbols';
import { AddressRepositoryFactory } from './contracts/factories/addressRepositoryFactory/addressRepositoryFactory';
import { AddressMapper } from './contracts/mappers/addressMapper/addressMapper';
import { AddressService } from './contracts/services/addressService/addressService';
import { AddressRepositoryFactoryImpl } from './implementations/factories/addressRepositoryFactory/addressRepositoryFactoryImpl';
import { AddressMapperImpl } from './implementations/mappers/addressMapper/addressMapperImpl';
import { AddressServiceImpl } from './implementations/services/addressService/addressServiceImpl';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('AddressModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new AddressModule()],
    });
  });

  it('declares bindings', async () => {
    expect.assertions(3);

    expect(container.get<AddressMapper>(addressSymbols.addressMapper)).toBeInstanceOf(AddressMapperImpl);

    expect(container.get<AddressRepositoryFactory>(addressSymbols.addressRepositoryFactory)).toBeInstanceOf(
      AddressRepositoryFactoryImpl,
    );

    expect(container.get<AddressService>(addressSymbols.addressService)).toBeInstanceOf(AddressServiceImpl);
  });
});
