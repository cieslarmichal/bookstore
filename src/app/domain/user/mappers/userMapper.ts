import { Mapper } from '../../../shared/mapper';
import { UserDto } from '../dtos';
import { User } from '../entities/user';

export class UserMapper implements Mapper<User, UserDto> {
  public mapEntityToDto(entity: User): UserDto {
    const { id, createdAt, updatedAt, email, password, role } = entity;

    return UserDto.create({
      id,
      createdAt,
      updatedAt,
      email,
      password,
      role,
    });
  }
}
