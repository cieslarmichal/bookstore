import { EntityManager } from 'typeorm';

import { WhishlistEntryEntity } from './whishlistEntryEntity/whishlistEntryEntity';
import { WhishlistEntryMapper } from './whishlistEntryMapper/whishlistEntryMapper';
import { Validator } from '../../../../../../libs/validator/validator';
import { WhishlistEntryNotFoundError } from '../../../application/errors/whishlistEntryNotFoundError';
import {
  CreateWhishlistEntryPayload,
  createWhishlistEntryPayloadSchema,
} from '../../../application/repositories/whishlistEntryRepository/payloads/createWhishlistEntryPayload';
import {
  DeleteWhishlistEntryPayload,
  deleteWhishlistEntryPayloadSchema,
} from '../../../application/repositories/whishlistEntryRepository/payloads/deleteWhishlistEntryPayload';
import {
  FindWhishlistEntriesPayload,
  findWhishlistEntriesPayloadSchema,
} from '../../../application/repositories/whishlistEntryRepository/payloads/findWhishlistEntriesPayload';
import {
  FindWhishlistEntryPayload,
  findWhishlistEntryPayloadSchema,
} from '../../../application/repositories/whishlistEntryRepository/payloads/findWhishlistEntryPayload';
import { WhishlistEntryRepository } from '../../../application/repositories/whishlistEntryRepository/whishlistEntryRepository';
import { WhishlistEntry } from '../../../domain/entities/whishlistEntry/whishlistEntry';

export class WhishlistEntryRepositoryImpl implements WhishlistEntryRepository {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly whishlistEntryMapper: WhishlistEntryMapper,
  ) {}

  public async createWhishlistEntry(input: CreateWhishlistEntryPayload): Promise<WhishlistEntry> {
    const { id, bookId, customerId } = Validator.validate(createWhishlistEntryPayloadSchema, input);

    const whishlistEntry = this.entityManager.create(WhishlistEntryEntity, { id, bookId, customerId });

    const savedWhishlistEntry = await this.entityManager.save(whishlistEntry);

    return this.whishlistEntryMapper.map(savedWhishlistEntry);
  }

  public async findWhishlistEntry(input: FindWhishlistEntryPayload): Promise<WhishlistEntry | null> {
    const { id, bookId, customerId } = Validator.validate(findWhishlistEntryPayloadSchema, input);

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

  public async findWhishlistEntries(input: FindWhishlistEntriesPayload): Promise<WhishlistEntry[]> {
    const { pagination, customerId } = Validator.validate(findWhishlistEntriesPayloadSchema, input);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    const whishlistEntrysEntities = await this.entityManager.find(WhishlistEntryEntity, {
      take: pagination.limit,
      skip: numberOfEnitiesToSkip,
      where: { customerId },
    });

    return whishlistEntrysEntities.map((whishlistEntryEntity) => this.whishlistEntryMapper.map(whishlistEntryEntity));
  }

  public async deleteWhishlistEntry(input: DeleteWhishlistEntryPayload): Promise<void> {
    const { id } = Validator.validate(deleteWhishlistEntryPayloadSchema, input);

    const whishlistEntryEntity = await this.findWhishlistEntry({ id });

    if (!whishlistEntryEntity) {
      throw new WhishlistEntryNotFoundError({ id });
    }

    await this.entityManager.delete(WhishlistEntryEntity, { id });
  }
}
