import { EntityManager, EntityRepository, FindConditions } from 'typeorm';
import { UserDto } from '../dtos';
import { User } from '../entities/user';
import { UserMapper } from '../mappers/userMapper';
import { UserAlreadyExists, UserNotFound } from '../errors';

@EntityRepository()
export class UserRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly userMapper: UserMapper) {}

  public async createOne(userData: Partial<User>): Promise<UserDto> {
    const { email } = userData;

    const existingUser = await this.findOne({ email });

    if (existingUser) {
      throw new UserAlreadyExists({ email: email as string });
    }

    const user = this.entityManager.create(User, userData);

    const savedUser = await this.entityManager.save(user);

    return this.userMapper.mapEntityToDto(savedUser);
  }

  public async findOne(conditions: FindConditions<User>): Promise<UserDto | null> {
    const user = await this.entityManager.findOne(User, conditions);

    if (!user) {
      return null;
    }

    return this.userMapper.mapEntityToDto(user);
  }

  public async findOneById(id: string): Promise<UserDto | null> {
    return this.findOne({ id });
  }

  public async findMany(conditions: FindConditions<User>): Promise<UserDto[]> {
    const users = await this.entityManager.find(User, conditions);

    return users.map((user) => this.userMapper.mapEntityToDto(user));
  }

  public async updateOne(id: string, userData: Partial<User>): Promise<UserDto> {
    const user = await this.findOneById(id);

    if (!user) {
      throw new UserNotFound({ id });
    }

    await this.entityManager.update(User, { id }, userData);

    return this.findOneById(id) as Promise<UserDto>;
  }

  public async removeOne(id: string): Promise<void> {
    const user = await this.findOneById(id);

    if (!user) {
      throw new UserNotFound({ id });
    }

    await this.entityManager.delete(User, { id });
  }
}
