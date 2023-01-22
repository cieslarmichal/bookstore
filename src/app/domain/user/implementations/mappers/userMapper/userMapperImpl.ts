import { UserMapper } from '../../../contracts/mappers/userMapper/userMapper';
import { User } from '../../../contracts/user';
import { UserEntity } from '../../../contracts/userEntity';

export class UserMapperImpl implements UserMapper {
  public map(entity: UserEntity): User {
    const { id, createdAt, updatedAt, email, phoneNumber, password, role } = entity;

    return new User({
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
