import { addressModuleSymbols } from './addressModuleSymbols';
import { AddressRepositoryFactory } from './application/repositories/addressRepository/addressRepositoryFactory';
import { AddressService } from './application/services/addressService/addressService';
import { AddressServiceImpl } from './application/services/addressService/addressServiceImpl';
import { AddressMapper } from './infrastructure/repositories/addressRepository/addressMapper/addressMapper';
import { AddressMapperImpl } from './infrastructure/repositories/addressRepository/addressMapper/addressMapperImpl';
import { AddressRepositoryFactoryImpl } from './infrastructure/repositories/addressRepository/addressRepositoryFactoryImpl';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class AddressModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<AddressMapper>(addressModuleSymbols.addressMapper, AddressMapperImpl);

    container.bindToConstructor<AddressRepositoryFactory>(
      addressModuleSymbols.addressRepositoryFactory,
      AddressRepositoryFactoryImpl,
    );

    container.bindToConstructor<AddressService>(addressModuleSymbols.addressService, AddressServiceImpl);
  }
}
