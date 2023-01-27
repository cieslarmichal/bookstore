import { EntityManager } from 'typeorm';

import { AuthorQueryBuilder } from './authorQueryBuilder';
import { Author } from '../../../contracts/author';
import { AuthorEntity } from '../../../contracts/authorEntity';
import { AuthorMapper } from '../../../contracts/mappers/authorMapper/authorMapper';
import { AuthorRepository } from '../../../contracts/repositories/authorRepository/authorRepository';
import { CreateOnePayload } from '../../../contracts/repositories/authorRepository/createOnePayload';
import { DeleteOnePayload } from '../../../contracts/repositories/authorRepository/deleteOnePayload';
import { FindManyPayload } from '../../../contracts/repositories/authorRepository/findManyPayload';
import { FindOnePayload } from '../../../contracts/repositories/authorRepository/findOnePayload';
import { UpdateOnePayload } from '../../../contracts/repositories/authorRepository/updateOnePayload';
import { AuthorNotFoundError } from '../../../errors/authorNotFoundError';

export class AuthorRepositoryImpl implements AuthorRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly authorMapper: AuthorMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Author> {
    const authorEntityInput: AuthorEntity = input;

    const authorEntity = this.entityManager.create(AuthorEntity, authorEntityInput);

    const savedAuthorEntity = await this.entityManager.save(authorEntity);

    return this.authorMapper.map(savedAuthorEntity);
  }

  public async findOne(input: FindOnePayload): Promise<Author | null> {
    const { id } = input;

    const authorEntity = await this.entityManager.findOne(AuthorEntity, { where: { id } });

    if (!authorEntity) {
      return null;
    }

    return this.authorMapper.map(authorEntity);
  }

  public async findMany(input: FindManyPayload): Promise<Author[]> {
    const { bookId, filters, paginationData } = input;

    let authorQueryBuilder = new AuthorQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (paginationData.page - 1) * paginationData.limit;

    if (bookId) {
      authorQueryBuilder = authorQueryBuilder.whereBookId(bookId);
    }

    const authorsEntities = await authorQueryBuilder
      .where(filters)
      .skip(numberOfEnitiesToSkip)
      .take(paginationData.limit)
      .getMany();

    return authorsEntities.map((authorEntity) => this.authorMapper.map(authorEntity));
  }

  public async updateOne(input: UpdateOnePayload): Promise<Author> {
    const { id, draft } = input;

    const authorEntity = await this.findOne({ id });

    if (!authorEntity) {
      throw new AuthorNotFoundError({ id });
    }

    await this.entityManager.update(AuthorEntity, { id }, { ...draft });

    const updatedAuthorEntity = await this.findOne({ id });

    return updatedAuthorEntity as Author;
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = input;

    const authorEntity = await this.findOne({ id });

    if (!authorEntity) {
      throw new AuthorNotFoundError({ id });
    }

    await this.entityManager.delete(AuthorEntity, { id });
  }
}
