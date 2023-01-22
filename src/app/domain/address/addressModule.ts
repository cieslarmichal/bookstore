import { asClass, AwilixContainer, Lifetime } from 'awilix';

import { addressSymbols } from './addressSymbols';
import { AddressRepositoryFactoryImpl } from './implementations/factories/addressRepositoryFactory/addressRepositoryFactoryImpl';
import { AddressMapperImpl } from './implementations/mappers/addressMapper/addressMapperImpl';
import { AddressServiceImpl } from './implementations/services/addressService/addressServiceImpl';
import { Module } from '../../libs/dependencyInjection/module';

export class AddressModule extends Module {
  public override async registerSymbols(container: AwilixContainer): Promise<void> {
    container.register({
      [addressSymbols.addressMapper]: asClass(AddressMapperImpl, { lifetime: Lifetime.SINGLETON }),
      [addressSymbols.addressRepositoryFactory]: asClass(AddressRepositoryFactoryImpl, {
        lifetime: Lifetime.SINGLETON,
      }),
      [addressSymbols.addressService]: asClass(AddressServiceImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
