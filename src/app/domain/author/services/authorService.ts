import { Filter } from '../../../shared';
import { LoggerService } from '../../../shared/logger/services/loggerService';
import { PaginationData } from '../../shared';
import { AuthorDto } from '../dtos';
import { AuthorNotFound } from '../errors';
import { AuthorRepository } from '../repositories/authorRepository';
import { CreateAuthorData, UpdateAuthorData } from './types';

export class AuthorService {
  public constructor(
    private readonly authorRepository: AuthorRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async createAuthor(authorData: CreateAuthorData): Promise<AuthorDto> {
    this.loggerService.debug('Creating author...');

    const author = await this.authorRepository.createOne(authorData);

    this.loggerService.info('Author created.', { authorId: author.id });

    return author;
  }

  public async findAuthor(authorId: string): Promise<AuthorDto> {
    const author = await this.authorRepository.findOneById(authorId);

    if (!author) {
      throw new AuthorNotFound({ id: authorId });
    }

    return author;
  }

  public async findAuthors(filters: Filter[], paginationData: PaginationData): Promise<AuthorDto[]> {
    const authors = await this.authorRepository.findMany(filters, paginationData);

    return authors;
  }

  public async findAuthorsByBookId(
    bookId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<AuthorDto[]> {
    const authors = await this.authorRepository.findManyByBookId(bookId, filters, paginationData);

    return authors;
  }

  public async updateAuthor(authorId: string, authorData: UpdateAuthorData): Promise<AuthorDto> {
    this.loggerService.debug('Updating author...', { authorId });

    const author = await this.authorRepository.updateOne(authorId, authorData);

    this.loggerService.info('Author updated.', { authorId });

    return author;
  }

  public async removeAuthor(authorId: string): Promise<void> {
    this.loggerService.debug('Removing author...', { authorId });

    await this.authorRepository.removeOne(authorId);

    this.loggerService.info('Author removed.', { authorId });
  }
}
