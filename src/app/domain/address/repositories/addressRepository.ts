import { EntityManager, EntityRepository, FindConditions } from 'typeorm';
import { AddressDto } from '../dtos';
import { Address } from '../entities/address';
import { AddressMapper } from '../mappers/addressMapper';
import { AddressNotFound } from '../errors';
import { PaginationData } from '../../shared';
import { Filter } from '../../../common';
import { AddressQueryBuilder } from './queryBuilder';

@EntityRepository()
export class AddressRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly addressMapper: AddressMapper) {}

  public async createOne(addressData: Partial<Address>): Promise<AddressDto> {
    const address = this.entityManager.create(Address, addressData);

    const savedAddress = await this.entityManager.save(address);

    return this.addressMapper.map(savedAddress);
  }

  public async findOne(conditions: FindConditions<Address>): Promise<AddressDto | null> {
    const address = await this.entityManager.findOne(Address, conditions);

    if (!address) {
      return null;
    }

    return this.addressMapper.map(address);
  }

  public async findOneById(id: string): Promise<AddressDto | null> {
    return this.findOne({ id });
  }

  public async findMany(filters: Filter[], paginationData: PaginationData): Promise<AddressDto[]> {
    const addressQueryBuilder = new AddressQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (paginationData.page - 1) * paginationData.limit;

    const addresses = await addressQueryBuilder
      .addressConditions(filters)
      .skip(numberOfEnitiesToSkip)
      .take(paginationData.limit)
      .getMany();

    return addresses.map((address) => this.addressMapper.map(address));
  }

  public async updateOne(id: string, addressData: Partial<Address>): Promise<AddressDto> {
    const address = await this.findOneById(id);

    if (!address) {
      throw new AddressNotFound({ id });
    }

    await this.entityManager.update(Address, { id }, addressData);

    return this.findOneById(id) as Promise<AddressDto>;
  }

  public async removeOne(id: string): Promise<void> {
    const address = await this.findOneById(id);

    if (!address) {
      throw new AddressNotFound({ id });
    }

    await this.entityManager.delete(Address, { id });
  }
}
