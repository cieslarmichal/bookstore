import { Filter, PostgresUnitOfWork } from '../../../common';
import { LoggerService } from '../../../common/logger/services/loggerService';
import { PaginationData } from '../../common';
import { AuthorDto } from '../dtos';
import { AuthorNotFound } from '../errors';
import { AuthorRepositoryFactory } from '../repositories/authorRepositoryFactory';
import { CreateAuthorData, UpdateAuthorData } from './types';

export class AuthorService {
  public constructor(
    private readonly authorRepositoryFactory: AuthorRepositoryFactory,
    private readonly loggerService: LoggerService,
  ) {}

  public async createAuthor(unitOfWork: PostgresUnitOfWork, authorData: CreateAuthorData): Promise<AuthorDto> {
    this.loggerService.debug('Creating author...');

    const { entityManager } = unitOfWork;

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const author = await authorRepository.createOne(authorData);

    this.loggerService.info('Author created.', { authorId: author.id });

    return author;
  }

  public async findAuthor(unitOfWork: PostgresUnitOfWork, authorId: string): Promise<AuthorDto> {
    const { entityManager } = unitOfWork;

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const author = await authorRepository.findOneById(authorId);

    if (!author) {
      throw new AuthorNotFound({ id: authorId });
    }

    return author;
  }

  public async findAuthors(
    unitOfWork: PostgresUnitOfWork,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<AuthorDto[]> {
    const { entityManager } = unitOfWork;

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const authors = await authorRepository.findMany(filters, paginationData);

    return authors;
  }

  public async findAuthorsByBookId(
    unitOfWork: PostgresUnitOfWork,
    bookId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<AuthorDto[]> {
    const { entityManager } = unitOfWork;

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const authors = await authorRepository.findManyByBookId(bookId, filters, paginationData);

    return authors;
  }

  public async updateAuthor(
    unitOfWork: PostgresUnitOfWork,
    authorId: string,
    authorData: UpdateAuthorData,
  ): Promise<AuthorDto> {
    this.loggerService.debug('Updating author...', { authorId });

    const { entityManager } = unitOfWork;

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const author = await authorRepository.updateOne(authorId, authorData);

    this.loggerService.info('Author updated.', { authorId });

    return author;
  }

  public async removeAuthor(unitOfWork: PostgresUnitOfWork, authorId: string): Promise<void> {
    this.loggerService.debug('Removing author...', { authorId });

    const { entityManager } = unitOfWork;

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    await authorRepository.removeOne(authorId);

    this.loggerService.info('Author removed.', { authorId });
  }
}
