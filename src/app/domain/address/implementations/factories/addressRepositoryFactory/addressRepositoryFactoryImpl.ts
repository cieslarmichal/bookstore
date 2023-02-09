import { EntityManager } from 'typeorm';

import { Inject, Injectable } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { addressSymbols } from '../../../addressSymbols';
import { AddressRepositoryFactory } from '../../../contracts/factories/addressRepositoryFactory/addressRepositoryFactory';
import { AddressMapper } from '../../../contracts/mappers/addressMapper/addressMapper';
import { AddressRepository } from '../../../contracts/repositories/addressRepository/addressRepository';
import { AddressRepositoryImpl } from '../../repositories/addressRepository/addressRepositoryImpl';

@Injectable()
export class AddressRepositoryFactoryImpl implements AddressRepositoryFactory {
  public constructor(
    @Inject(addressSymbols.addressMapper)
    private readonly addressMapper: AddressMapper,
  ) {}

  public create(entityManager: EntityManager): AddressRepository {
    return new AddressRepositoryImpl(entityManager, this.addressMapper);
  }
}
