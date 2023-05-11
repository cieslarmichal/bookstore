import { CreateAddressCommandHandler } from './application/commandHandlers/createAddressCommandHandler/createAddressCommandHandler';
import { CreateAddressCommandHandlerImpl } from './application/commandHandlers/createAddressCommandHandler/createAddressCommandHandlerImpl';
import { DeleteAddressCommandHandler } from './application/commandHandlers/deleteAddressCommandHandler/deleteAddressCommandHandler';
import { DeleteAddressCommandHandlerImpl } from './application/commandHandlers/deleteAddressCommandHandler/deleteAddressCommandHandlerImpl';
import { UpdateAddressCommandHandler } from './application/commandHandlers/updateAddressCommandHandler/updateAddressCommandHandler';
import { UpdateAddressCommandHandlerImpl } from './application/commandHandlers/updateAddressCommandHandler/updateAddressCommandHandlerImpl';
import { FindAddressesQueryHandler } from './application/queryHandlers/findAddressesQueryHandler/findAddressesQueryHandler';
import { FindAddressesQueryHandlerImpl } from './application/queryHandlers/findAddressesQueryHandler/findAddressesQueryHandlerImpl';
import { FindAddressQueryHandler } from './application/queryHandlers/findAddressQueryHandler/findAddressQueryHandler';
import { FindAddressQueryHandlerImpl } from './application/queryHandlers/findAddressQueryHandler/findAddressQueryHandlerImpl';
import { AddressRepositoryFactory } from './application/repositories/addressRepository/addressRepositoryFactory';
import { AddressHttpController } from './infrastructure/httpControllers/addressHttpController/addressHttpController';
import { AddressMapper } from './infrastructure/repositories/addressRepository/addressMapper/addressMapper';
import { AddressMapperImpl } from './infrastructure/repositories/addressRepository/addressMapper/addressMapperImpl';
import { AddressRepositoryFactoryImpl } from './infrastructure/repositories/addressRepository/addressRepositoryFactoryImpl';
import { symbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class AddressModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<AddressMapper>(symbols.addressMapper, AddressMapperImpl);

    container.bindToConstructor<AddressRepositoryFactory>(
      symbols.addressRepositoryFactory,
      AddressRepositoryFactoryImpl,
    );

    container.bindToConstructor<CreateAddressCommandHandler>(
      symbols.createAddressCommandHandler,
      CreateAddressCommandHandlerImpl,
    );

    container.bindToConstructor<UpdateAddressCommandHandler>(
      symbols.updateAddressCommandHandler,
      UpdateAddressCommandHandlerImpl,
    );

    container.bindToConstructor<DeleteAddressCommandHandler>(
      symbols.deleteAddressCommandHandler,
      DeleteAddressCommandHandlerImpl,
    );

    container.bindToConstructor<FindAddressQueryHandler>(symbols.findAddressQueryHandler, FindAddressQueryHandlerImpl);

    container.bindToConstructor<FindAddressesQueryHandler>(
      symbols.findAddressesQueryHandler,
      FindAddressesQueryHandlerImpl,
    );

    container.bindToConstructor<AddressHttpController>(symbols.addressHttpController, AddressHttpController);
  }
}
