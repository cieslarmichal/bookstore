import { LoggerService } from '../../../shared/logger/services/loggerService';
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

  public async findAuthors(bookId: string): Promise<AuthorDto[]> {
    const authors = await this.authorRepository.findManyByBookId(bookId);

    return authors;
  }

  public async updateAuthor(authorId: string, authorData: UpdateAuthorData): Promise<AuthorDto> {
    this.loggerService.debug('Updating author...', { authorId });

    const author = await this.authorRepository.updateOne(authorId, authorData);

    console.log('Author updated.', { authorId });

    return author;
  }

  public async removeAuthor(authorId: string): Promise<void> {
    this.loggerService.debug('Removing author...', { authorId });

    await this.authorRepository.removeOne(authorId);

    console.log('Author removed.', { authorId });
  }
}
