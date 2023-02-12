import { Injectable } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { UserMapper } from '../../../contracts/mappers/userMapper/userMapper';
import { User } from '../../../contracts/user';
import { UserEntity } from '../../../contracts/userEntity';

@Injectable()
export class UserMapperImpl implements UserMapper {
  public map(entity: UserEntity): User {
    const { id, email, phoneNumber, password, role } = entity;

    return new User({
      id,
      email: email || undefined,
      phoneNumber: phoneNumber || undefined,
      password,
      role,
    });
  }
}
