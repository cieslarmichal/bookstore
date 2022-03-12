import { EntityManager, EntityRepository, FindConditions } from 'typeorm';
import { AuthorBookDto } from '../dtos';
import { AuthorBook } from '../entities/authorBook';
import { AuthorBookMapper } from '../mappers/authorBookMapper';
import { AuthorBookNotFound } from '../errors';

@EntityRepository()
export class AuthorBookRepository {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly authorBookMapper: AuthorBookMapper,
  ) {}

  public async createOne(authorBookData: Partial<AuthorBook>): Promise<AuthorBookDto> {
    const authorBook = this.entityManager.create(AuthorBook, authorBookData);

    const savedAuthorBook = await this.entityManager.save(authorBook);

    return this.authorBookMapper.mapEntityToDto(savedAuthorBook);
  }

  public async findOne(conditions: FindConditions<AuthorBook>): Promise<AuthorBookDto | null> {
    const authorBook = await this.entityManager.findOne(AuthorBook, conditions);

    if (!authorBook) {
      return null;
    }

    return this.authorBookMapper.mapEntityToDto(authorBook);
  }

  public async findOneById(id: string): Promise<AuthorBookDto | null> {
    return this.findOne({ id });
  }

  public async removeOne(id: string): Promise<void> {
    const authorBook = await this.findOneById(id);

    if (!authorBook) {
      throw new AuthorBookNotFound({ id });
    }

    await this.entityManager.delete(AuthorBook, { id });
  }
}
