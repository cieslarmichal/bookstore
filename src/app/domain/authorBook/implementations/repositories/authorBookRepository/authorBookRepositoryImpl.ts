import { EntityManager } from 'typeorm';

import { AuthorBook } from '../../../contracts/authorBook';
import { AuthorBookEntity } from '../../../contracts/authorBookEntity';
import { AuthorBookMapper } from '../../../contracts/mappers/authorBookMapper/authorBookMapper';
import { AuthorBookRepository } from '../../../contracts/repositories/authorBookRepository/authorBookRepository';
import { CreateOnePayload } from '../../../contracts/repositories/authorBookRepository/createOnePayload';
import { DeleteOnePayload } from '../../../contracts/repositories/authorBookRepository/deleteOnePayload';
import { FindOnePayload } from '../../../contracts/repositories/authorBookRepository/findOnePayload';
import { AuthorBookNotFoundError } from '../../../errors/authorBookNotFoundError';

export class AuthorBookRepositoryImpl implements AuthorBookRepository {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly authorBookMapper: AuthorBookMapper,
  ) {}

  public async createOne(input: CreateOnePayload): Promise<AuthorBook> {
    const authorBookEntityInput: AuthorBookEntity = input;

    const authorBookEntity = this.entityManager.create(AuthorBookEntity, { ...authorBookEntityInput });

    const savedAuthorBookEntity = await this.entityManager.save(authorBookEntity);

    return this.authorBookMapper.map(savedAuthorBookEntity);
  }

  public async findOne(input: FindOnePayload): Promise<AuthorBook | null> {
    const authorBookEntity = await this.entityManager.findOne(AuthorBookEntity, { where: { ...input } });

    if (!authorBookEntity) {
      return null;
    }

    return this.authorBookMapper.map(authorBookEntity);
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = input;

    const authorBookEntity = await this.findOne({ id });

    if (!authorBookEntity) {
      throw new AuthorBookNotFoundError({ id });
    }

    await this.entityManager.delete(AuthorBookEntity, { id });
  }
}
