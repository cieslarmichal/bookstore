import 'reflect-metadata';

import { UserMapperImpl } from './userMapperImpl';
import { UserEntityTestFactory } from '../../../../tests/factories/userEntityTestFactory/userEntityTestFactory';

describe('UserMapperImpl', () => {
  let userMapperImpl: UserMapperImpl;

  const userEntityTestFactory = new UserEntityTestFactory();

  beforeAll(async () => {
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
