import { EntityManager } from 'typeorm';

import { UserEntity } from './userEntity/userEntity';
import { UserMapper } from './userMapper/userMapper';
import { Validator } from '../../../../../../libs/validator/validator';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../application/repositories/userRepository/payloads/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../application/repositories/userRepository/payloads/deleteOnePayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../application/repositories/userRepository/payloads/findOnePayload';
import {
  UpdateOnePayload,
  updateOnePayloadSchema,
} from '../../../application/repositories/userRepository/payloads/updateOnePayload';
import { UserRepository } from '../../../application/repositories/userRepository/userRepository';
import { User } from '../../../domain/entities/user/user';
import { UserNotFoundError } from '../../errors/userNotFoundError';

export class UserRepositoryImpl implements UserRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly userMapper: UserMapper) {}

  public async createOne(input: CreateOnePayload): Promise<User> {
    const { id, email, phoneNumber, password } = Validator.validate(createOnePayloadSchema, input);

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

  public async findOne(input: FindOnePayload): Promise<User | null> {
    const { id, email, phoneNumber } = Validator.validate(findOnePayloadSchema, input);

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

  public async updateOne(input: UpdateOnePayload): Promise<User> {
    const {
      id,
      draft: { email, password, phoneNumber },
    } = Validator.validate(updateOnePayloadSchema, input);

    const userEntity = await this.findOne({ id });

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

    const updatedUserEntity = await this.findOne({ id });

    return updatedUserEntity as User;
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = Validator.validate(deleteOnePayloadSchema, input);

    const userEntity = await this.findOne({ id });

    if (!userEntity) {
      throw new UserNotFoundError({ id });
    }

    await this.entityManager.delete(UserEntity, { id });
  }
}
