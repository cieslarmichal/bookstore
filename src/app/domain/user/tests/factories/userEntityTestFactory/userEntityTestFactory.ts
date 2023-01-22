import { faker } from '@faker-js/faker';

import { UserEntity } from '../../../contracts/userEntity';
import { UserRole } from '../../../contracts/userRole';

export class UserEntityTestFactory {
  public create(): UserEntity {
    return {
      id: faker.datatype.uuid(),
      createdAt: faker.date.recent(3),
      updatedAt: faker.date.recent(1),
      email: faker.internet.email(),
      phoneNumber: faker.phone.number(),
      password: faker.internet.password(24),
      role: UserRole.user,
    };
  }
}
