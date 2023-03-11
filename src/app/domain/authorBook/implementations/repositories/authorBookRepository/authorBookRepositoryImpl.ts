import { EntityManager } from 'typeorm';

import { Validator } from '../../../../../../libs/validator/implementations/validator';
import { AuthorBook } from '../../../contracts/authorBook';
import { AuthorBookEntity } from '../../../contracts/authorBookEntity';
import { AuthorBookMapper } from '../../../contracts/mappers/authorBookMapper/authorBookMapper';
import { AuthorBookRepository } from '../../../contracts/repositories/authorBookRepository/authorBookRepository';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../contracts/repositories/authorBookRepository/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../contracts/repositories/authorBookRepository/deleteOnePayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../contracts/repositories/authorBookRepository/findOnePayload';
import { AuthorBookNotFoundError } from '../../../errors/authorBookNotFoundError';

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
