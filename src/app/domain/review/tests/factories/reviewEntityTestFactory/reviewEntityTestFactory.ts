import { faker } from '@faker-js/faker';

import { ReviewEntity } from '../../../contracts/reviewEntity';

export class ReviewEntityTestFactory {
  public create(input: Partial<ReviewEntity> = {}): ReviewEntity {
    return {
      id: faker.datatype.uuid(),
      isbn: faker.datatype.number({ min: 1000000000000, max: 9999999999999 }).toString(),
      rate: faker.datatype.number({ min: 1, max: 10 }),
      comment: faker.lorem.words(),
      customerId: faker.datatype.uuid(),
      ...input,
    };
  }
}
