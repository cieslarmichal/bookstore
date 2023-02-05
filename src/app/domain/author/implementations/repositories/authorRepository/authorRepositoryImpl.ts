import { EntityManager } from 'typeorm';

import { AuthorQueryBuilder } from './authorQueryBuilder';
import { PayloadFactory } from '../../../../../common/validator/implementations/payloadFactory';
import { Author } from '../../../contracts/author';
import { AuthorEntity } from '../../../contracts/authorEntity';
import { AuthorMapper } from '../../../contracts/mappers/authorMapper/authorMapper';
import { AuthorRepository } from '../../../contracts/repositories/authorRepository/authorRepository';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../contracts/repositories/authorRepository/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../contracts/repositories/authorRepository/deleteOnePayload';
import {
  FindManyPayload,
  findManyPayloadSchema,
} from '../../../contracts/repositories/authorRepository/findManyPayload';
import { FindOnePayload, findOnePayloadSchema } from '../../../contracts/repositories/authorRepository/findOnePayload';
import {
  UpdateOnePayload,
  updateOnePayloadSchema,
} from '../../../contracts/repositories/authorRepository/updateOnePayload';
import { AuthorNotFoundError } from '../../../errors/authorNotFoundError';

export class AuthorRepositoryImpl implements AuthorRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly authorMapper: AuthorMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Author> {
    const { id, firstName, lastName, about } = PayloadFactory.create(createOnePayloadSchema, input);

    let authorEntityInput: AuthorEntity = { id, firstName, lastName };

    if (about) {
      authorEntityInput = { ...authorEntityInput, about };
    }

    const authorEntity = this.entityManager.create(AuthorEntity, authorEntityInput);

    const savedAuthorEntity = await this.entityManager.save(authorEntity);

    return this.authorMapper.map(savedAuthorEntity);
  }

  public async findOne(input: FindOnePayload): Promise<Author | null> {
    const { id } = PayloadFactory.create(findOnePayloadSchema, input);

    const authorEntity = await this.entityManager.findOne(AuthorEntity, { where: { id } });

    if (!authorEntity) {
      return null;
    }

    return this.authorMapper.map(authorEntity);
  }

  public async findMany(input: FindManyPayload): Promise<Author[]> {
    const { bookId, filters, pagination } = PayloadFactory.create(findManyPayloadSchema, input);

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
    } = PayloadFactory.create(updateOnePayloadSchema, input);

    const authorEntity = await this.findOne({ id });

    if (!authorEntity) {
      throw new AuthorNotFoundError({ id });
    }

    await this.entityManager.update(AuthorEntity, { id }, { about });

    const updatedAuthorEntity = await this.findOne({ id });

    return updatedAuthorEntity as Author;
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = PayloadFactory.create(deleteOnePayloadSchema, input);

    const authorEntity = await this.findOne({ id });

    if (!authorEntity) {
      throw new AuthorNotFoundError({ id });
    }

    await this.entityManager.delete(AuthorEntity, { id });
  }
}
