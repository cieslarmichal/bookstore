import { Mapper } from '../../../common/mapper';
import { UserDto } from '../dtos';
import { User } from '../entities/user';

export class UserMapper implements Mapper<User, UserDto> {
  public map(entity: User): UserDto {
    const { id, createdAt, updatedAt, email, phoneNumber, password, role } = entity;

    return UserDto.create({
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
