import { EntityManager } from 'typeorm';
import { AddressRepositoryFactory } from '../../../contracts/factories/addressRepositoryFactory/addressRepositoryFactory';
import { AddressMapper } from '../../../contracts/mappers/addressMapper/addressMapper';
import { AddressRepository } from '../../../contracts/repositories/addressRepository/addressRepository';
import { AddressRepositoryImpl } from '../../repositories/addressRepository/addressRepositoryImpl';

export class AddressRepositoryFactoryImpl implements AddressRepositoryFactory {
  public constructor(private readonly addressMapper: AddressMapper) {}

  public create(entityManager: EntityManager): AddressRepository {
    return new AddressRepositoryImpl(entityManager, this.addressMapper);
  }
}
