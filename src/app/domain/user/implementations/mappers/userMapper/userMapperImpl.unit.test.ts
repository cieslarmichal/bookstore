import { UserEntityTestFactory } from '../../../tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserMapperImpl } from './userMapperImpl';

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

    expect(user).toStrictEqual({
      id: userEntity.id,
      createdAt: userEntity.createdAt,
      updatedAt: userEntity.updatedAt,
      email: userEntity.email,
      phoneNumber: userEntity.phoneNumber,
      password: userEntity.password,
      role: userEntity.role,
    });
  });
});
