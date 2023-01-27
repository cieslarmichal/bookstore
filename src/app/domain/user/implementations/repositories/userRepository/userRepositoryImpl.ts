import { EntityManager } from 'typeorm';

import { UserMapper } from '../../../contracts/mappers/userMapper/userMapper';
import { CreateOnePayload } from '../../../contracts/repositories/userRepository/createOnePayload';
import { DeleteOnePayload } from '../../../contracts/repositories/userRepository/deleteOnePayload';
import { FindOnePayload } from '../../../contracts/repositories/userRepository/findOnePayload';
import { UpdateOnePayload } from '../../../contracts/repositories/userRepository/updateOnePayload';
import { UserRepository } from '../../../contracts/repositories/userRepository/userRepository';
import { User } from '../../../contracts/user';
import { UserEntity } from '../../../contracts/userEntity';
import { UserNotFoundError } from '../../../errors/userNotFoundError';

export class UserRepositoryImpl implements UserRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly userMapper: UserMapper) {}

  public async createOne(input: CreateOnePayload): Promise<User> {
    const userEntityInput: UserEntity = input;

    const userEntity = this.entityManager.create(UserEntity, userEntityInput);

    const savedUserEntity = await this.entityManager.save(userEntity);

    return this.userMapper.map(savedUserEntity);
  }

  public async findOne(input: FindOnePayload): Promise<User | null> {
    const userEntity = await this.entityManager.findOne(UserEntity, { where: { ...input } });

    if (!userEntity) {
      return null;
    }

    return this.userMapper.map(userEntity);
  }

  public async updateOne(input: UpdateOnePayload): Promise<User> {
    const { id, draft } = input;

    const userEntity = await this.findOne({ id });

    if (!userEntity) {
      throw new UserNotFoundError({ id });
    }

    await this.entityManager.update(UserEntity, { id }, { ...draft });

    const updatedUserEntity = await this.findOne({ id });

    return updatedUserEntity as User;
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = input;

    const userEntity = await this.findOne({ id });

    if (!userEntity) {
      throw new UserNotFoundError({ id });
    }

    await this.entityManager.delete(UserEntity, { id });
  }
}
