import { EntityManager, EntityRepository, FindConditions } from 'typeorm';

import { UserMapper } from '../../../contracts/mappers/userMapper/userMapper';
import { UserRepository } from '../../../contracts/repositories/userRepository/userRepository';
import { User } from '../../../contracts/user';
import { UserEntity } from '../../../contracts/userEntity';
import { UserNotFoundError } from '../../../errors/userNotFoundError';

@EntityRepository()
export class UserRepositoryImpl implements UserRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly userMapper: UserMapper) {}

  public async createOne(userData: Partial<UserEntity>): Promise<User> {
    const user = this.entityManager.create(UserEntity, userData);

    const savedUser = await this.entityManager.save(user);

    return this.userMapper.map(savedUser);
  }

  public async findOne(conditions: FindConditions<UserEntity>): Promise<User | null> {
    const user = await this.entityManager.findOne(UserEntity, conditions);

    if (!user) {
      return null;
    }

    return this.userMapper.map(user);
  }

  public async findOneById(id: string): Promise<User | null> {
    return this.findOne({ id });
  }

  public async findMany(conditions: FindConditions<UserEntity>): Promise<User[]> {
    const users = await this.entityManager.find(UserEntity, conditions);

    return users.map((user) => this.userMapper.map(user));
  }

  public async updateOne(id: string, userData: Partial<UserEntity>): Promise<User> {
    const user = await this.findOneById(id);

    if (!user) {
      throw new UserNotFoundError({ id });
    }

    await this.entityManager.update(UserEntity, { id }, userData);

    return this.findOneById(id) as Promise<User>;
  }

  public async removeOne(id: string): Promise<void> {
    const user = await this.findOneById(id);

    if (!user) {
      throw new UserNotFoundError({ id });
    }

    await this.entityManager.delete(UserEntity, { id });
  }
}
