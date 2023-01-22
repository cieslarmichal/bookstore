import { EntityManager, EntityRepository, FindConditions } from 'typeorm';

import { AddressQueryBuilder } from './addressQueryBuilder';
import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../common/paginationData';
import { Address } from '../../../contracts/address';
import { AddressEntity } from '../../../contracts/addressEntity';
import { AddressMapper } from '../../../contracts/mappers/addressMapper/addressMapper';
import { AddressRepository } from '../../../contracts/repositories/addressRepository/addressRepository';
import { AddressNotFoundError } from '../../../errors/addressNotFoundError';

@EntityRepository()
export class AddressRepositoryImpl implements AddressRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly addressMapper: AddressMapper) {}

  public async createOne(addressData: Partial<AddressEntity>): Promise<Address> {
    const address = this.entityManager.create(AddressEntity, addressData);

    const savedAddress = await this.entityManager.save(address);

    return this.addressMapper.map(savedAddress);
  }

  public async findOne(conditions: FindConditions<AddressEntity>): Promise<Address | null> {
    const address = await this.entityManager.findOne(AddressEntity, conditions);

    if (!address) {
      return null;
    }

    return this.addressMapper.map(address);
  }

  public async findOneById(id: string): Promise<Address | null> {
    return this.findOne({ id });
  }

  public async findMany(filters: Filter[], paginationData: PaginationData): Promise<Address[]> {
    const addressQueryBuilder = new AddressQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (paginationData.page - 1) * paginationData.limit;

    const addresses = await addressQueryBuilder
      .addressConditions(filters)
      .skip(numberOfEnitiesToSkip)
      .take(paginationData.limit)
      .getMany();

    return addresses.map((address) => this.addressMapper.map(address));
  }

  public async updateOne(id: string, addressData: Partial<AddressEntity>): Promise<Address> {
    const address = await this.findOneById(id);

    if (!address) {
      throw new AddressNotFoundError({ id });
    }

    await this.entityManager.update(AddressEntity, { id }, addressData);

    return this.findOneById(id) as Promise<Address>;
  }

  public async removeOne(id: string): Promise<void> {
    const address = await this.findOneById(id);

    if (!address) {
      throw new AddressNotFoundError({ id });
    }

    await this.entityManager.delete(AddressEntity, { id });
  }
}
