import { addressSymbols } from './addressSymbols';
import { AddressRepositoryFactory } from './contracts/factories/addressRepositoryFactory/addressRepositoryFactory';
import { AddressMapper } from './contracts/mappers/addressMapper/addressMapper';
import { AddressService } from './contracts/services/addressService/addressService';
import { AddressRepositoryFactoryImpl } from './implementations/factories/addressRepositoryFactory/addressRepositoryFactoryImpl';
import { AddressMapperImpl } from './implementations/mappers/addressMapper/addressMapperImpl';
import { AddressServiceImpl } from './implementations/services/addressService/addressServiceImpl';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class AddressModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<AddressMapper>(addressSymbols.addressMapper, AddressMapperImpl);

    container.bindToConstructor<AddressRepositoryFactory>(
      addressSymbols.addressRepositoryFactory,
      AddressRepositoryFactoryImpl,
    );

    container.bindToConstructor<AddressService>(addressSymbols.addressService, AddressServiceImpl);
  }
}
