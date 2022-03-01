import { EntityManager, EntityRepository, FindConditions } from 'typeorm';
import { AuthorDto } from '../dtos';
import { Author } from '../entities/author';
import { AuthorMapper } from '../mappers/authorMapper';
import { AuthorNotFound } from '../errors';

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

  public async findOneById(id: number): Promise<AuthorDto | null> {
    return this.findOne({ id });
  }

  public async findMany(conditions: FindConditions<Author>): Promise<AuthorDto[]> {
    const authors = await this.entityManager.find(Author, conditions);

    return authors.map((author) => this.authorMapper.mapEntityToDto(author));
  }

  public async updateOne(id: number, authorData: Partial<Author>): Promise<AuthorDto> {
    const author = await this.findOneById(id);

    if (!author) {
      throw new AuthorNotFound({ id: id.toString() });
    }

    await this.entityManager.update(Author, { id }, authorData);

    return this.findOneById(id) as Promise<AuthorDto>;
  }

  public async removeOne(id: number): Promise<void> {
    const author = await this.findOneById(id);

    if (!author) {
      throw new AuthorNotFound({ id: id.toString() });
    }

    await this.entityManager.delete(Author, { id });
  }
}
