import { faker } from '@faker-js/faker';

import { UserEntity } from '../../../infrastructure/repositories/userRepository/userEntity/userEntity';

export class UserEntityTestFactory {
  public create(input: Partial<UserEntity> = {}): UserEntity {
    return {
      id: faker.datatype.uuid(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.number(),
      password: faker.internet.password(24),
      ...input,
    };
  }
}
