import { EntityManager } from 'typeorm';

import { AuthorEntity } from './authorEntity/authorEntity';
import { AuthorMapper } from './authorMapper/authorMapper';
import { AuthorQueryBuilder } from './authorQueryBuilder';
import { Validator } from '../../../../../../libs/validator/validator';
import { AuthorNotFoundError } from '../../../application/errors/authorNotFoundError';
import { AuthorRepository } from '../../../application/repositories/authorRepository/authorRepository';
import {
  CreateAuthorPayload,
  createAuthorPayloadSchema,
} from '../../../application/repositories/authorRepository/payloads/createAuthorPayload';
import {
  DeleteAuthorPayload,
  deleteAuthorPayloadSchema,
} from '../../../application/repositories/authorRepository/payloads/deleteAuthorPayload';
import {
  FindAuthorPayload,
  findAuthorPayloadSchema,
} from '../../../application/repositories/authorRepository/payloads/findAuthorPayload';
import {
  FindAuthorsPayload,
  findAuthorsPayloadSchema,
} from '../../../application/repositories/authorRepository/payloads/findAuthorsPayload';
import {
  UpdateAuthorPayload,
  updateAuthorPayloadSchema,
} from '../../../application/repositories/authorRepository/payloads/updateAuthorPayload';
import { Author } from '../../../domain/entities/author/author';

export class AuthorRepositoryImpl implements AuthorRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly authorMapper: AuthorMapper) {}

  public async createAuthor(input: CreateAuthorPayload): Promise<Author> {
    const { id, firstName, lastName, about } = Validator.validate(createAuthorPayloadSchema, input);

    let authorEntityInput: AuthorEntity = { id, firstName, lastName };

    if (about) {
      authorEntityInput = { ...authorEntityInput, about };
    }

    const authorEntity = this.entityManager.create(AuthorEntity, authorEntityInput);

    const savedAuthorEntity = await this.entityManager.save(authorEntity);

    return this.authorMapper.map(savedAuthorEntity);
  }

  public async findAuthor(input: FindAuthorPayload): Promise<Author | null> {
    const { id } = Validator.validate(findAuthorPayloadSchema, input);

    const authorEntity = await this.entityManager.findOneBy(AuthorEntity, { id });

    if (!authorEntity) {
      return null;
    }

    return this.authorMapper.map(authorEntity);
  }

  public async findAuthors(input: FindAuthorsPayload): Promise<Author[]> {
    const { bookId, filters, pagination } = Validator.validate(findAuthorsPayloadSchema, input);

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

  public async updateAuthor(input: UpdateAuthorPayload): Promise<Author> {
    const {
      id,
      draft: { about },
    } = Validator.validate(updateAuthorPayloadSchema, input);

    const authorEntity = await this.findAuthor({ id });

    if (!authorEntity) {
      throw new AuthorNotFoundError({ id });
    }

    await this.entityManager.update(AuthorEntity, { id }, { about });

    const updatedAuthorEntity = await this.findAuthor({ id });

    return updatedAuthorEntity as Author;
  }

  public async deleteAuthor(input: DeleteAuthorPayload): Promise<void> {
    const { id } = Validator.validate(deleteAuthorPayloadSchema, input);

    const authorEntity = await this.findAuthor({ id });

    if (!authorEntity) {
      throw new AuthorNotFoundError({ id });
    }

    await this.entityManager.delete(AuthorEntity, { id });
  }
}
