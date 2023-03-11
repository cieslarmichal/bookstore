import { EntityManager } from 'typeorm';

import { Validator } from '../../../../../../libs/validator/implementations/validator';
import { WhishlistEntryMapper } from '../../../contracts/mappers/whishlistEntryMapper/whishlistEntryMapper';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../contracts/repositories/whishlistEntryRepository/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../contracts/repositories/whishlistEntryRepository/deleteOnePayload';
import {
  FindManyPayload,
  findManyPayloadSchema,
} from '../../../contracts/repositories/whishlistEntryRepository/findManyPayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../contracts/repositories/whishlistEntryRepository/findOnePayload';
import { WhishlistEntryRepository } from '../../../contracts/repositories/whishlistEntryRepository/whishlistEntryRepository';
import { WhishlistEntry } from '../../../contracts/whishlistEntry';
import { WhishlistEntryEntity } from '../../../contracts/whishlistEntryEntity';
import { WhishlistEntryNotFoundError } from '../../../errors/whishlistEntryNotFoundError';

export class WhishlistEntryRepositoryImpl implements WhishlistEntryRepository {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly whishlistEntryMapper: WhishlistEntryMapper,
  ) {}

  public async createOne(input: CreateOnePayload): Promise<WhishlistEntry> {
    const { id, bookId, customerId } = Validator.validate(createOnePayloadSchema, input);

    const whishlistEntry = this.entityManager.create(WhishlistEntryEntity, { id, bookId, customerId });

    const savedWhishlistEntry = await this.entityManager.save(whishlistEntry);

    return this.whishlistEntryMapper.map(savedWhishlistEntry);
  }

  public async findOne(input: FindOnePayload): Promise<WhishlistEntry | null> {
    const { id, bookId, customerId } = Validator.validate(findOnePayloadSchema, input);

    let findWhishlistEntryInput = {};

    if (id) {
      findWhishlistEntryInput = { ...findWhishlistEntryInput, id };
    }

    if (bookId) {
      findWhishlistEntryInput = { ...findWhishlistEntryInput, bookId };
    }

    if (customerId) {
      findWhishlistEntryInput = { ...findWhishlistEntryInput, customerId };
    }

    const whishlistEntryEntity = await this.entityManager.findOne(WhishlistEntryEntity, {
      where: findWhishlistEntryInput,
    });

    if (!whishlistEntryEntity) {
      return null;
    }

    return this.whishlistEntryMapper.map(whishlistEntryEntity);
  }

  public async findMany(input: FindManyPayload): Promise<WhishlistEntry[]> {
    const { pagination, customerId } = Validator.validate(findManyPayloadSchema, input);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    const whishlistEntrysEntities = await this.entityManager.find(WhishlistEntryEntity, {
      take: pagination.limit,
      skip: numberOfEnitiesToSkip,
      where: { customerId },
    });

    return whishlistEntrysEntities.map((whishlistEntryEntity) => this.whishlistEntryMapper.map(whishlistEntryEntity));
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = Validator.validate(deleteOnePayloadSchema, input);

    const whishlistEntryEntity = await this.findOne({ id });

    if (!whishlistEntryEntity) {
      throw new WhishlistEntryNotFoundError({ id });
    }

    await this.entityManager.delete(WhishlistEntryEntity, { id });
  }
}
