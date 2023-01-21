import { Filter } from '../../../../../common/filter/filter';
import { LoggerService } from '../../../../../libs/logger/loggerService';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { PaginationData } from '../../../../common/paginationData';
import { Author } from '../../../contracts/author';
import { AuthorRepositoryFactory } from '../../../contracts/factories/authorRepositoryFactory/authorRepositoryFactory';
import { AuthorService } from '../../../contracts/services/authorService/authorService';
import { CreateAuthorData } from '../../../contracts/services/authorService/createAuthorData';
import { UpdateAuthorData } from '../../../contracts/services/authorService/updateAuthorData';
import { AuthorNotFound } from '../../../errors/authorNotFound';

export class AuthorServiceImpl implements AuthorService {
  public constructor(
    private readonly authorRepositoryFactory: AuthorRepositoryFactory,
    private readonly loggerService: LoggerService,
  ) {}

  public async createAuthor(unitOfWork: PostgresUnitOfWork, authorData: CreateAuthorData): Promise<Author> {
    this.loggerService.debug('Creating author...');

    const { entityManager } = unitOfWork;

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const author = await authorRepository.createOne(authorData);

    this.loggerService.info('Author created.', { authorId: author.id });

    return author;
  }

  public async findAuthor(unitOfWork: PostgresUnitOfWork, authorId: string): Promise<Author> {
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
  ): Promise<Author[]> {
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
  ): Promise<Author[]> {
    const { entityManager } = unitOfWork;

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const authors = await authorRepository.findManyByBookId(bookId, filters, paginationData);

    return authors;
  }

  public async updateAuthor(
    unitOfWork: PostgresUnitOfWork,
    authorId: string,
    authorData: UpdateAuthorData,
  ): Promise<Author> {
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
