import { EntityManager } from 'typeorm';

import { AddressMapper } from './addressMapper/addressMapper';
import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/decorators';
import { AddressRepository } from '../../../application/repositories/addressRepository/addressRepository';
import { AddressRepositoryFactory } from '../../../application/repositories/addressRepository/addressRepositoryFactory';
import { symbols } from '../../../symbols';
import { AddressRepositoryImpl } from '../../repositories/addressRepository/addressRepositoryImpl';

@Injectable()
export class AddressRepositoryFactoryImpl implements AddressRepositoryFactory {
  public constructor(
    @Inject(symbols.addressMapper)
    private readonly addressMapper: AddressMapper,
  ) {}

  public create(entityManager: EntityManager): AddressRepository {
    return new AddressRepositoryImpl(entityManager, this.addressMapper);
  }
}
