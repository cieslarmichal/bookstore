import { EntityManager, FindConditions } from 'typeorm';

import { AuthorQueryBuilder } from './authorQueryBuilder';
import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../common/paginationData';
import { Author } from '../../../contracts/author';
import { AuthorEntity } from '../../../contracts/authorEntity';
import { AuthorMapper } from '../../../contracts/mappers/authorMapper/authorMapper';
import { AuthorRepository } from '../../../contracts/repositories/authorRepository/authorRepository';
import { AuthorNotFoundError } from '../../../errors/authorNotFoundError';

export class AuthorRepositoryImpl implements AuthorRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly authorMapper: AuthorMapper) {}

  public async createOne(authorData: Partial<AuthorEntity>): Promise<Author> {
    const author = this.entityManager.create(AuthorEntity, authorData);

    const savedAuthor = await this.entityManager.save(author);

    return this.authorMapper.map(savedAuthor);
  }

  public async findOne(conditions: FindConditions<AuthorEntity>): Promise<Author | null> {
    const author = await this.entityManager.findOne(AuthorEntity, conditions);

    if (!author) {
      return null;
    }

    return this.authorMapper.map(author);
  }

  public async findOneById(id: string): Promise<Author | null> {
    return this.findOne({ id });
  }

  public async findMany(filters: Filter[], paginationData: PaginationData): Promise<Author[]> {
    const authorQueryBuilder = new AuthorQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (paginationData.page - 1) * paginationData.limit;

    const authors = await authorQueryBuilder
      .authorConditions(filters)
      .skip(numberOfEnitiesToSkip)
      .take(paginationData.limit)
      .getMany();

    return authors.map((author) => this.authorMapper.map(author));
  }

  public async findManyByBookId(bookId: string, filters: Filter[], paginationData: PaginationData): Promise<Author[]> {
    const authorQueryBuilder = new AuthorQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (paginationData.page - 1) * paginationData.limit;

    const authors = await authorQueryBuilder
      .bookConditions(bookId)
      .authorConditions(filters)
      .skip(numberOfEnitiesToSkip)
      .take(paginationData.limit)
      .getMany();

    return authors.map((author) => this.authorMapper.map(author));
  }

  public async updateOne(id: string, authorData: Partial<AuthorEntity>): Promise<Author> {
    const author = await this.findOneById(id);

    if (!author) {
      throw new AuthorNotFoundError({ id });
    }

    await this.entityManager.update(AuthorEntity, { id }, authorData);

    return this.findOneById(id) as Promise<Author>;
  }

  public async deleteOne(id: string): Promise<void> {
    const author = await this.findOneById(id);

    if (!author) {
      throw new AuthorNotFoundError({ id });
    }

    await this.entityManager.delete(AuthorEntity, { id });
  }
}
