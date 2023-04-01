import { addressModuleSymbols } from './addressModuleSymbols';
import { AddressRepositoryFactory } from './application/repositories/addressRepository/addressRepositoryFactory';
import { AddressService } from './application/services/addressService/addressService';
import { AddressServiceImpl } from './application/services/addressService/addressServiceImpl';
import { AddressController } from './infrastructure/httpControllers/addressController/addressController';
import { AddressMapper } from './infrastructure/repositories/addressRepository/addressMapper/addressMapper';
import { AddressMapperImpl } from './infrastructure/repositories/addressRepository/addressMapper/addressMapperImpl';
import { AddressRepositoryFactoryImpl } from './infrastructure/repositories/addressRepository/addressRepositoryFactoryImpl';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class AddressModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<AddressMapper>(addressModuleSymbols.addressMapper, AddressMapperImpl);

    container.bindToConstructor<AddressRepositoryFactory>(
      addressModuleSymbols.addressRepositoryFactory,
      AddressRepositoryFactoryImpl,
    );

    container.bindToConstructor<AddressService>(addressModuleSymbols.addressService, AddressServiceImpl);

    container.bindToConstructor<AddressController>(addressModuleSymbols.addressController, AddressController);
  }
}
