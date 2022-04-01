import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../shared';
import { ADDRESS_MAPPER, ADDRESS_REPOSITORY_FACTORY, ADDRESS_SERVICE } from './addressInjectionSymbols';
import { AddressMapper } from './mappers/addressMapper';
import { AddressRepositoryFactory } from './repositories/addressRepositoryFactory';
import { AddressService } from './services/addressService';

export class AddressModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [ADDRESS_MAPPER]: asClass(AddressMapper, { lifetime: Lifetime.SINGLETON }),
      [ADDRESS_REPOSITORY_FACTORY]: asClass(AddressRepositoryFactory, { lifetime: Lifetime.SINGLETON }),
      [ADDRESS_SERVICE]: asClass(AddressService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
