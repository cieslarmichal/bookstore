import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../libs/dependencyInjection/loadableModule';
import { addressSymbols } from './addressSymbols';
import { AddressRepositoryFactoryImpl } from './implementations/factories/addressRepositoryFactory/addressRepositoryFactoryImpl';
import { AddressMapperImpl } from './implementations/mappers/addressMapper/addressMapperImpl';
import { AddressServiceImpl } from './implementations/services/addressService/addressServiceImpl';

export class AddressModule extends LoadableModule {
  public override async loadDependenciesIntoContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [addressSymbols.addressMapper]: asClass(AddressMapperImpl, { lifetime: Lifetime.SINGLETON }),
      [addressSymbols.addressRepositoryFactory]: asClass(AddressRepositoryFactoryImpl, {
        lifetime: Lifetime.SINGLETON,
      }),
      [addressSymbols.addressService]: asClass(AddressServiceImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
