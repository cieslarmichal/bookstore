import 'reflect-metadata';

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

    expect(address).toEqual({
      id: addressEntity.id,
      firstName: addressEntity.firstName,
      lastName: addressEntity.lastName,
      phoneNumber: addressEntity.phoneNumber,
      country: addressEntity.country,
      state: addressEntity.state,
      city: addressEntity.city,
      zipCode: addressEntity.zipCode,
      streetAddress: addressEntity.streetAddress,
      deliveryInstructions: addressEntity.deliveryInstructions,
      customerId: addressEntity.customerId,
    });
  });
});
