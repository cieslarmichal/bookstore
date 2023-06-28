import 'reflect-metadata';

import { AddressHttpController } from './api/httpControllers/addressHttpController/addressHttpController';
import { FindAddressQueryHandler } from './application/queryHandlers/findAddressQueryHandler/findAddressQueryHandler';
import { FindAddressQueryHandlerImpl } from './application/queryHandlers/findAddressQueryHandler/findAddressQueryHandlerImpl';
import { AddressRepositoryFactory } from './application/repositories/addressRepository/addressRepositoryFactory';
import { AddressRepositoryFactoryImpl } from './infrastructure/repositories/addressRepository/addressRepositoryFactoryImpl';
import { addressSymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { Application } from '../../application';

describe('AddressModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(container.get<AddressHttpController>(addressSymbols.addressHttpController)).toBeInstanceOf(
      AddressHttpController,
    );

    expect(container.get<AddressRepositoryFactory>(addressSymbols.addressRepositoryFactory)).toBeInstanceOf(
      AddressRepositoryFactoryImpl,
    );

    expect(container.get<FindAddressQueryHandler>(addressSymbols.findAddressQueryHandler)).toBeInstanceOf(
      FindAddressQueryHandlerImpl,
    );
  });
});
