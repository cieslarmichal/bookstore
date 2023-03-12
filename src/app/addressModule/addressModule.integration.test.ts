import 'reflect-metadata';

import { AddressModule } from './addressModule';
import { addressModuleSymbols } from './addressModuleSymbols';
import { AddressRepositoryFactory } from './application/repositories/addressRepository/addressRepositoryFactory';
import { AddressService } from './application/services/addressService/addressService';
import { AddressServiceImpl } from './application/services/addressService/addressServiceImpl';
import { AddressController } from './infrastructure/httpControllers/addressController';
import { AddressMapper } from './infrastructure/repositories/addressRepository/addressMapper/addressMapper';
import { AddressMapperImpl } from './infrastructure/repositories/addressRepository/addressMapper/addressMapperImpl';
import { AddressRepositoryFactoryImpl } from './infrastructure/repositories/addressRepository/addressRepositoryFactoryImpl';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
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
    expect(container.get<AddressMapper>(addressModuleSymbols.addressMapper)).toBeInstanceOf(AddressMapperImpl);

    expect(container.get<AddressRepositoryFactory>(addressModuleSymbols.addressRepositoryFactory)).toBeInstanceOf(
      AddressRepositoryFactoryImpl,
    );

    expect(container.get<AddressService>(addressModuleSymbols.addressService)).toBeInstanceOf(AddressServiceImpl);

    expect(container.get<AddressController>(addressModuleSymbols.addressController)).toBeInstanceOf(AddressController);
  });
});
