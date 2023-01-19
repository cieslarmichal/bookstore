import { EntityManager, EntityRepository, FindConditions } from 'typeorm';
import { AuthorDto } from '../dtos';
import { Author } from '../entities/author';
import { AuthorMapper } from '../mappers/authorMapper';
import { AuthorNotFound } from '../errors';
import { PaginationData } from '../../common';
import { AuthorQueryBuilder } from './queryBuilder';
import { Filter } from '../../../common';

@EntityRepository()
export class AuthorRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly authorMapper: AuthorMapper) {}

  public async createOne(authorData: Partial<Author>): Promise<AuthorDto> {
    const author = this.entityManager.create(Author, authorData);

    const savedAuthor = await this.entityManager.save(author);

    return this.authorMapper.map(savedAuthor);
  }

  public async findOne(conditions: FindConditions<Author>): Promise<AuthorDto | null> {
    const author = await this.entityManager.findOne(Author, conditions);

    if (!author) {
      return null;
    }

    return this.authorMapper.map(author);
  }

  public async findOneById(id: string): Promise<AuthorDto | null> {
    return this.findOne({ id });
  }

  public async findMany(filters: Filter[], paginationData: PaginationData): Promise<AuthorDto[]> {
    const authorQueryBuilder = new AuthorQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (paginationData.page - 1) * paginationData.limit;

    const authors = await authorQueryBuilder
      .authorConditions(filters)
      .skip(numberOfEnitiesToSkip)
      .take(paginationData.limit)
      .getMany();

    return authors.map((author) => this.authorMapper.map(author));
  }

  public async findManyByBookId(
    bookId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<AuthorDto[]> {
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

  public async updateOne(id: string, authorData: Partial<Author>): Promise<AuthorDto> {
    const author = await this.findOneById(id);

    if (!author) {
      throw new AuthorNotFound({ id });
    }

    await this.entityManager.update(Author, { id }, authorData);

    return this.findOneById(id) as Promise<AuthorDto>;
  }

  public async removeOne(id: string): Promise<void> {
    const author = await this.findOneById(id);

    if (!author) {
      throw new AuthorNotFound({ id });
    }

    await this.entityManager.delete(Author, { id });
  }
}
