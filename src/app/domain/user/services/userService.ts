import { UserDto } from '../dtos';
import { UserNotFound } from '../errors';
import { UserRepository } from '../repositories/userRepository';
import { CreateUserData } from './types';

export class UserService {
  public constructor(private readonly userRepository: UserRepository) {}

  public async createUser(userData: CreateUserData): Promise<UserDto> {
    console.log('Creating user...');

    const user = await this.userRepository.createOne(userData);

    console.log('User created.');

    return user;
  }

  public async findUser(userId: string): Promise<UserDto> {
    const user = await this.userRepository.findOneById(userId);

    if (!user) {
      throw new UserNotFound({ id: userId });
    }

    return user;
  }

  public async removeUser(userId: string): Promise<void> {
    console.log(`Removing user with id ${userId}...`);

    await this.userRepository.removeOne(userId);

    console.log(`User with id ${userId} removed.`);
  }
}
