import { describe, it, beforeAll, expect } from 'vitest';

import { UserMapperImpl } from './userMapperImpl';
import { UserEntityTestFactory } from '../../../tests/factories/userEntityTestFactory/userEntityTestFactory';

describe('UserMapperImpl', () => {
  let userMapperImpl: UserMapperImpl;
  let userEntityTestFactory: UserEntityTestFactory;

  beforeAll(async () => {
    userEntityTestFactory = new UserEntityTestFactory();
    userMapperImpl = new UserMapperImpl();
  });

  it('maps a user entity to a user', async () => {
    expect.assertions(1);

    const userEntity = userEntityTestFactory.create();

    const user = userMapperImpl.map(userEntity);

    expect(user).toEqual({
      id: userEntity.id,
      email: userEntity.email,
      phoneNumber: userEntity.phoneNumber,
      password: userEntity.password,
      role: userEntity.role,
    });
  });
});
