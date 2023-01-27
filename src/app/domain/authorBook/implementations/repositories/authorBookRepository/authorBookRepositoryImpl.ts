import { EntityManager } from 'typeorm';

import { AuthorBook } from '../../../contracts/authorBook';
import { AuthorBookEntity } from '../../../contracts/authorBookEntity';
import { AuthorBookMapper } from '../../../contracts/mappers/authorBookMapper/authorBookMapper';
import { AuthorBookRepository } from '../../../contracts/repositories/authorBookRepository/authorBookRepository';
import { AuthorBookNotFoundError } from '../../../errors/authorBookNotFoundError';

export class AuthorBookRepositoryImpl implements AuthorBookRepository {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly authorBookMapper: AuthorBookMapper,
  ) {}

  public async createOne(authorBookData: Partial<AuthorBookEntity>): Promise<AuthorBook> {
    const authorBook = this.entityManager.create(AuthorBookEntity, authorBookData);

    const savedAuthorBook = await this.entityManager.save(authorBook);

    return this.authorBookMapper.map(savedAuthorBook);
  }

  public async findOne(conditions: FindConditions<AuthorBookEntity>): Promise<AuthorBook | null> {
    const authorBook = await this.entityManager.findOne(AuthorBookEntity, conditions);

    if (!authorBook) {
      return null;
    }

    return this.authorBookMapper.map(authorBook);
  }

  public async findOneById(id: string): Promise<AuthorBook | null> {
    return this.findOne({ id });
  }

  public async deleteOne(id: string): Promise<void> {
    const authorBook = await this.findOneById(id);

    if (!authorBook) {
      throw new AuthorBookNotFoundError({ id });
    }

    await this.entityManager.delete(AuthorBookEntity, { id });
  }
}
