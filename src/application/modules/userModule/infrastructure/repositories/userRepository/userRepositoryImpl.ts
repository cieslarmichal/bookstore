import { EntityManager } from 'typeorm';

import { UserEntity } from './userEntity/userEntity';
import { UserMapper } from './userMapper/userMapper';
import { Validator } from '../../../../../../libs/validator/validator';
import { UserNotFoundError } from '../../../application/errors/userNotFoundError';
import {
  CreateUserPayload,
  createUserPayloadSchema,
} from '../../../application/repositories/userRepository/payloads/createUserPayload';
import {
  DeleteUserPayload,
  deleteUserPayloadSchema,
} from '../../../application/repositories/userRepository/payloads/deleteUserPayload';
import {
  FindUserPayload,
  findUserPayloadSchema,
} from '../../../application/repositories/userRepository/payloads/findUserPayload';
import {
  UpdateUserPayload,
  updateUserPayloadSchema,
} from '../../../application/repositories/userRepository/payloads/updateUserPayload';
import { UserRepository } from '../../../application/repositories/userRepository/userRepository';
import { User } from '../../../domain/entities/user/user';

export class UserRepositoryImpl implements UserRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly userMapper: UserMapper) {}

  public async createUser(input: CreateUserPayload): Promise<User> {
    const { id, email, phoneNumber, password } = Validator.validate(createUserPayloadSchema, input);

    let userEntityInput: UserEntity = { id, password };

    if (email) {
      userEntityInput = { ...userEntityInput, email };
    }

    if (phoneNumber) {
      userEntityInput = { ...userEntityInput, phoneNumber };
    }

    const userEntity = this.entityManager.create(UserEntity, userEntityInput);

    const savedUserEntity = await this.entityManager.save(userEntity);

    return this.userMapper.map(savedUserEntity);
  }

  public async findUser(input: FindUserPayload): Promise<User | null> {
    const { id, email, phoneNumber } = Validator.validate(findUserPayloadSchema, input);

    let findOneInput = {};

    if (id) {
      findOneInput = { ...findOneInput, id };
    }

    if (email) {
      findOneInput = { ...findOneInput, email };
    }

    if (phoneNumber) {
      findOneInput = { ...findOneInput, phoneNumber };
    }

    const userEntity = await this.entityManager.findOne(UserEntity, { where: { ...findOneInput } });

    if (!userEntity) {
      return null;
    }

    return this.userMapper.map(userEntity);
  }

  public async updateUser(input: UpdateUserPayload): Promise<User> {
    const {
      id,
      draft: { email, password, phoneNumber },
    } = Validator.validate(updateUserPayloadSchema, input);

    const userEntity = await this.findUser({ id });

    if (!userEntity) {
      throw new UserNotFoundError({ id });
    }

    let updateOneInput = {};

    if (password) {
      updateOneInput = { ...updateOneInput, password };
    }

    if (email) {
      updateOneInput = { ...updateOneInput, email };
    }

    if (phoneNumber) {
      updateOneInput = { ...updateOneInput, phoneNumber };
    }

    await this.entityManager.update(UserEntity, { id }, { ...updateOneInput });

    const updatedUserEntity = await this.findUser({ id });

    return updatedUserEntity as User;
  }

  public async deleteUser(input: DeleteUserPayload): Promise<void> {
    const { id } = Validator.validate(deleteUserPayloadSchema, input);

    const userEntity = await this.findUser({ id });

    if (!userEntity) {
      throw new UserNotFoundError({ id });
    }

    await this.entityManager.delete(UserEntity, { id });
  }
}
