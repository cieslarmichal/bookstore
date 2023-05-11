import { EntityManager } from 'typeorm';

import { AuthorBookEntity } from './authorBookEntity/authorBookEntity';
import { AuthorBookMapper } from './authorBookMapper/authorBookMapper';
import { Validator } from '../../../../../../libs/validator/validator';
import { AuthorBookRepository } from '../../../application/repositories/authorBookRepository/authorBookRepository';
import {
  CreateAuthorBookPayload,
  createAuthorBookPayloadSchema,
} from '../../../application/repositories/authorBookRepository/payloads/createAuthorBookPayload';
import {
  DeleteAuthorBookPayload,
  deleteAuthorBookPayloadSchema,
} from '../../../application/repositories/authorBookRepository/payloads/deleteAuthorBookPayload';
import {
  FindAuthorBookPayload,
  findAuthorBookPayloadSchema,
} from '../../../application/repositories/authorBookRepository/payloads/findAuthorBookPayload';
import { AuthorBook } from '../../../domain/entities/authorBook/authorBook';
import { AuthorBookNotFoundError } from '../../errors/authorBookNotFoundError';

export class AuthorBookRepositoryImpl implements AuthorBookRepository {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly authorBookMapper: AuthorBookMapper,
  ) {}

  public async createAuthorBook(input: CreateAuthorBookPayload): Promise<AuthorBook> {
    const { id, authorId, bookId } = Validator.validate(createAuthorBookPayloadSchema, input);

    const authorBookEntity = this.entityManager.create(AuthorBookEntity, { id, authorId, bookId });

    const savedAuthorBookEntity = await this.entityManager.save(authorBookEntity);

    return this.authorBookMapper.map(savedAuthorBookEntity);
  }

  public async findAuthorBook(input: FindAuthorBookPayload): Promise<AuthorBook | null> {
    const { authorId, bookId, id } = Validator.validate(findAuthorBookPayloadSchema, input);

    let findOneInput = {};

    if (id) {
      findOneInput = { ...findOneInput, id };
    }

    if (authorId) {
      findOneInput = { ...findOneInput, authorId };
    }

    if (bookId) {
      findOneInput = { ...findOneInput, bookId };
    }

    const authorBookEntity = await this.entityManager.findOne(AuthorBookEntity, { where: { ...findOneInput } });

    if (!authorBookEntity) {
      return null;
    }

    return this.authorBookMapper.map(authorBookEntity);
  }

  public async deleteAuthorBook(input: DeleteAuthorBookPayload): Promise<void> {
    const { id } = Validator.validate(deleteAuthorBookPayloadSchema, input);

    const authorBookEntity = await this.findAuthorBook({ id });

    if (!authorBookEntity) {
      throw new AuthorBookNotFoundError({ id });
    }

    await this.entityManager.delete(AuthorBookEntity, { id });
  }
}
