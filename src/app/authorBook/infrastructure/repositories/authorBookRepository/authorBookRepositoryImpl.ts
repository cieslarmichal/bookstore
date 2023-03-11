import { EntityManager } from 'typeorm';

import { AuthorBookEntity } from './authorBookEntity/authorBookEntity';
import { AuthorBookMapper } from './authorBookMapper/authorBookMapper';
import { Validator } from '../../../../../libs/validator/implementations/validator';
import { AuthorBookRepository } from '../../../application/repositories/authorBookRepository/authorBookRepository';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../application/repositories/authorBookRepository/payloads/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../application/repositories/authorBookRepository/payloads/deleteOnePayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../application/repositories/authorBookRepository/payloads/findOnePayload';
import { AuthorBook } from '../../../domain/entities/authorBook';
import { AuthorBookNotFoundError } from '../../errors/authorBookNotFoundError';

export class AuthorBookRepositoryImpl implements AuthorBookRepository {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly authorBookMapper: AuthorBookMapper,
  ) {}

  public async createOne(input: CreateOnePayload): Promise<AuthorBook> {
    const { id, authorId, bookId } = Validator.validate(createOnePayloadSchema, input);

    const authorBookEntity = this.entityManager.create(AuthorBookEntity, { id, authorId, bookId });

    const savedAuthorBookEntity = await this.entityManager.save(authorBookEntity);

    return this.authorBookMapper.map(savedAuthorBookEntity);
  }

  public async findOne(input: FindOnePayload): Promise<AuthorBook | null> {
    const { authorId, bookId, id } = Validator.validate(findOnePayloadSchema, input);

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

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = Validator.validate(deleteOnePayloadSchema, input);

    const authorBookEntity = await this.findOne({ id });

    if (!authorBookEntity) {
      throw new AuthorBookNotFoundError({ id });
    }

    await this.entityManager.delete(AuthorBookEntity, { id });
  }
}
