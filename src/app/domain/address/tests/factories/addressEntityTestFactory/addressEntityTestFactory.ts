import { faker } from '@faker-js/faker';
import { AddressEntity } from '../../../contracts/addressEntity';

export class AddressEntityTestFactory {
  public create(): AddressEntity {
    return {
      id: faker.datatype.uuid(),
      createdAt: faker.date.recent(3),
      updatedAt: faker.date.recent(1),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phoneNumber: faker.phone.phoneNumber(),
      country: faker.address.country(),
      state: faker.address.state(),
      city: faker.address.city(),
      zipCode: faker.address.zipCode(),
      streetAddress: faker.address.streetAddress(true),
      deliveryInstructions: faker.lorem.words(),
      customerId: faker.datatype.uuid(),
    };
  }
}
