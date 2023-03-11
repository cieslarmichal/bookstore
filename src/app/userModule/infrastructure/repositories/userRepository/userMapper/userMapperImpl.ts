import { UserMapper } from './userMapper';
import { Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { User } from '../../../../domain/entities/user/user';
import { UserEntity } from '../userEntity/userEntity';

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
