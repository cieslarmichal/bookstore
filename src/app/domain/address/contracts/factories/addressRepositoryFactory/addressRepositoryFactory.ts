import { EntityManager } from 'typeorm';
import { AddressRepository } from '../../repositories/addressRepository/addressRepository';

export interface AddressRepositoryFactory {
  create(entityManager: EntityManager): AddressRepository;
}
