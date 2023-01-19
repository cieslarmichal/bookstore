import { UserMapper } from '../../../contracts/mappers/userMapper/userMapper';
import { UserEntity } from '../../../contracts/userEntity';
import { User } from '../../../contracts/user';

export class UserMapperImpl implements UserMapper {
  public map(entity: UserEntity): User {
    const { id, createdAt, updatedAt, email, phoneNumber, password, role } = entity;

    return User.create({
      id,
      createdAt,
      updatedAt,
      email,
      phoneNumber,
      password,
      role,
    });
  }
}
