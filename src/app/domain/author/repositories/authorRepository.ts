import { EntityManager, EntityRepository, FindConditions } from 'typeorm';
import { AuthorDto } from '../dtos';
import { Author } from '../entities/author';
import { AuthorMapper } from '../mappers/authorMapper';
import { AuthorNotFound } from '../errors';
import { PaginationData } from '../../shared';

@EntityRepository()
export class AuthorRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly authorMapper: AuthorMapper) {}

  public async createOne(authorData: Partial<Author>): Promise<AuthorDto> {
    const author = this.entityManager.create(Author, authorData);

    const savedAuthor = await this.entityManager.save(author);

    return this.authorMapper.mapEntityToDto(savedAuthor);
  }

  public async findOne(conditions: FindConditions<Author>): Promise<AuthorDto | null> {
    const author = await this.entityManager.findOne(Author, conditions);

    if (!author) {
      return null;
    }

    return this.authorMapper.mapEntityToDto(author);
  }

  public async findOneById(id: string): Promise<AuthorDto | null> {
    return this.findOne({ id });
  }

  public async findMany(conditions: FindConditions<Author>, paginationData: PaginationData): Promise<AuthorDto[]> {
    const queryBuilder = this.entityManager.getRepository(Author).createQueryBuilder('author');

    const numberOfEnitiesToSkip = (paginationData.page - 1) * paginationData.limit;

    const authors = await queryBuilder
      .where(conditions)
      .skip(numberOfEnitiesToSkip)
      .take(paginationData.limit)
      .getMany();

    return authors.map((author) => this.authorMapper.mapEntityToDto(author));
  }

  public async findManyByBookId(bookId: string): Promise<AuthorDto[]> {
    const queryBuilder = this.entityManager.getRepository(Author).createQueryBuilder('author');

    const authors = await queryBuilder
      .leftJoinAndSelect('author.authorBooks', 'authorBooks')
      .leftJoinAndSelect('authorBooks.book', 'book')
      .where('book.id = :bookId', { bookId })
      .getMany();

    return authors.map((author) => this.authorMapper.mapEntityToDto(author));
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
