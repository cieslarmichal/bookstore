import { EntityManager } from 'typeorm';

import { AddressQueryBuilder } from './addressQueryBuilder';
import { Address } from '../../../contracts/address';
import { AddressEntity } from '../../../contracts/addressEntity';
import { AddressMapper } from '../../../contracts/mappers/addressMapper/addressMapper';
import { AddressRepository } from '../../../contracts/repositories/addressRepository/addressRepository';
import { CreateOnePayload } from '../../../contracts/repositories/addressRepository/createOnePayload';
import { DeleteOnePayload } from '../../../contracts/repositories/addressRepository/deleteOnePayload';
import { FindManyPayload } from '../../../contracts/repositories/addressRepository/findManyPayload';
import { FindOnePayload } from '../../../contracts/repositories/addressRepository/findOnePayload';
import { UpdateOnePayload } from '../../../contracts/repositories/addressRepository/updateOnePayload';
import { AddressNotFoundError } from '../../../errors/addressNotFoundError';

export class AddressRepositoryImpl implements AddressRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly addressMapper: AddressMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Address> {
    const addressEntityInput: AddressEntity = input;

    const addressEntity = this.entityManager.create(AddressEntity, addressEntityInput);

    const savedAddressEntity = await this.entityManager.save(addressEntity);

    return this.addressMapper.map(savedAddressEntity);
  }

  public async findOne(input: FindOnePayload): Promise<Address | null> {
    const { id } = input;

    const addressEntity = await this.entityManager.findOne(AddressEntity, { where: { id } });

    if (!addressEntity) {
      return null;
    }

    return this.addressMapper.map(addressEntity);
  }

  public async findMany(input: FindManyPayload): Promise<Address[]> {
    const { filters, pagination } = input;

    const addressQueryBuilder = new AddressQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    const addressesEntities = await addressQueryBuilder
      .where(filters)
      .skip(numberOfEnitiesToSkip)
      .take(pagination.limit)
      .getMany();

    return addressesEntities.map((address) => this.addressMapper.map(address));
  }

  public async updateOne(input: UpdateOnePayload): Promise<Address> {
    const { id, draft } = input;

    const addressEntity = await this.findOne({ id });

    if (!addressEntity) {
      throw new AddressNotFoundError({ id });
    }

    await this.entityManager.update(AddressEntity, { id }, { ...draft });

    const updatedAddressEntity = await this.findOne({ id });

    return updatedAddressEntity as Address;
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = input;

    const addressEntity = await this.findOne({ id });

    if (!addressEntity) {
      throw new AddressNotFoundError({ id });
    }

    await this.entityManager.delete(AddressEntity, { id });
  }
}
