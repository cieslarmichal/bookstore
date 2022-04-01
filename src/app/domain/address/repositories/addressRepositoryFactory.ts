import { EntityManager } from 'typeorm';
import { AddressMapper } from '../mappers/addressMapper';
import { AddressRepository } from './addressRepository';

export class AddressRepositoryFactory {
  public constructor(private readonly addressMapper: AddressMapper) {}

  public create(entityManager: EntityManager): AddressRepository {
    return new AddressRepository(entityManager, this.addressMapper);
  }
}
