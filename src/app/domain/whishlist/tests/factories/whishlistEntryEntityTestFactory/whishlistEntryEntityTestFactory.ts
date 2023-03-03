import { faker } from '@faker-js/faker';

import { WhishlistEntryEntity } from '../../../contracts/whishlistEntryEntity';

export class WhishlistEntryEntityTestFactory {
  public create(input: Partial<WhishlistEntryEntity> = {}): WhishlistEntryEntity {
    return {
      id: faker.datatype.uuid(),
      bookId: faker.datatype.uuid(),
      customerId: faker.datatype.uuid(),
      ...input,
    };
  }
}
