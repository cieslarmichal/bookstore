import { EntityManager } from 'typeorm';

import { AuthorEntity } from './authorEntity/authorEntity';
import { AuthorMapper } from './authorMapper/authorMapper';
import { AuthorQueryBuilder } from './authorQueryBuilder';
import { Validator } from '../../../../../libs/validator/implementations/validator';
import { AuthorRepository } from '../../../application/repositories/authorRepository/authorRepository';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../application/repositories/authorRepository/payloads/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../application/repositories/authorRepository/payloads/deleteOnePayload';
import {
  FindManyPayload,
  findManyPayloadSchema,
} from '../../../application/repositories/authorRepository/payloads/findManyPayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../application/repositories/authorRepository/payloads/findOnePayload';
import {
  UpdateOnePayload,
  updateOnePayloadSchema,
} from '../../../application/repositories/authorRepository/payloads/updateOnePayload';
import { Author } from '../../../domain/entities/author';
import { AuthorNotFoundError } from '../../errors/authorNotFoundError';

export class AuthorRepositoryImpl implements AuthorRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly authorMapper: AuthorMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Author> {
    const { id, firstName, lastName, about } = Validator.validate(createOnePayloadSchema, input);

    let authorEntityInput: AuthorEntity = { id, firstName, lastName };

    if (about) {
      authorEntityInput = { ...authorEntityInput, about };
    }

    const authorEntity = this.entityManager.create(AuthorEntity, authorEntityInput);

    const savedAuthorEntity = await this.entityManager.save(authorEntity);

    return this.authorMapper.map(savedAuthorEntity);
  }

  public async findOne(input: FindOnePayload): Promise<Author | null> {
    const { id } = Validator.validate(findOnePayloadSchema, input);

    const authorEntity = await this.entityManager.findOneBy(AuthorEntity, { id });

    if (!authorEntity) {
      return null;
    }

    return this.authorMapper.map(authorEntity);
  }

  public async findMany(input: FindManyPayload): Promise<Author[]> {
    const { bookId, filters, pagination } = Validator.validate(findManyPayloadSchema, input);

    let authorQueryBuilder = new AuthorQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    if (bookId) {
      authorQueryBuilder = authorQueryBuilder.whereBookId(bookId);
    }

    const authorsEntities = await authorQueryBuilder
      .where(filters)
      .skip(numberOfEnitiesToSkip)
      .take(pagination.limit)
      .getMany();

    return authorsEntities.map((authorEntity) => this.authorMapper.map(authorEntity));
  }

  public async updateOne(input: UpdateOnePayload): Promise<Author> {
    const {
      id,
      draft: { about },
    } = Validator.validate(updateOnePayloadSchema, input);

    const authorEntity = await this.findOne({ id });

    if (!authorEntity) {
      throw new AuthorNotFoundError({ id });
    }

    await this.entityManager.update(AuthorEntity, { id }, { about });

    const updatedAuthorEntity = await this.findOne({ id });

    return updatedAuthorEntity as Author;
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = Validator.validate(deleteOnePayloadSchema, input);

    const authorEntity = await this.findOne({ id });

    if (!authorEntity) {
      throw new AuthorNotFoundError({ id });
    }

    await this.entityManager.delete(AuthorEntity, { id });
  }
}
