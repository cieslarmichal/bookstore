import { describe, it, beforeAll, expect } from 'vitest';

import { AddressMapperImpl } from './addressMapperImpl';
import { AddressEntityTestFactory } from '../../../tests/factories/addressEntityTestFactory/addressEntityTestFactory';

describe('AddressMapperImpl', () => {
  let addressMapperImpl: AddressMapperImpl;
  let addressEntityTestFactory: AddressEntityTestFactory;

  beforeAll(async () => {
    addressEntityTestFactory = new AddressEntityTestFactory();
    addressMapperImpl = new AddressMapperImpl();
  });

  it('map address entity to address', async () => {
    expect.assertions(1);

    const addressEntity = addressEntityTestFactory.create();

    const address = addressMapperImpl.map(addressEntity);

    expect(address).toStrictEqual({
      id: addressEntity.id,
      createdAt: addressEntity.createdAt,
      updatedAt: addressEntity.updatedAt,
      firstName: addressEntity.firstName,
      lastName: addressEntity.lastName,
      phoneNumber: addressEntity.phoneNumber,
      country: addressEntity.country,
      state: addressEntity.state,
      city: addressEntity.city,
      zipCode: addressEntity.zipCode,
      streetAddress: addressEntity.streetAddress,
      deliveryInstructions: addressEntity.deliveryInstructions,
      customerId: addressEntity.id,
    });
  });
});
