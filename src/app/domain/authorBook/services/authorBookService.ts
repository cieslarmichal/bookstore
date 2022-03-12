import { AuthorBookDto } from '../dtos';
import { AuthorBookAlreadyExists, AuthorBookNotFound } from '../errors';
import { AuthorBookRepository } from '../repositories/authorBookRepository';
import { CreateAuthorBookData, RemoveAuthorBookData } from './types';

export class AuthorBookService {
  public constructor(private readonly authorBookRepository: AuthorBookRepository) {}

  public async createAuthorBook(authorBookData: CreateAuthorBookData): Promise<AuthorBookDto> {
    console.log('Creating authorBook...');

    const { authorId, bookId } = authorBookData;

    const existingAuthorBook = await this.authorBookRepository.findOne({ authorId, bookId });

    if (existingAuthorBook) {
      throw new AuthorBookAlreadyExists({ authorId, bookId });
    }

    const authorBook = await this.authorBookRepository.createOne(authorBookData);

    console.log('AuthorBook created.');

    return authorBook;
  }

  public async removeAuthorBook(authorBookData: RemoveAuthorBookData): Promise<void> {
    console.log(`Removing authorBook...`);

    const { authorId, bookId } = authorBookData;

    const authorBook = await this.authorBookRepository.findOne({ authorId, bookId });

    if (!authorBook) {
      throw new AuthorBookNotFound({ authorId, bookId });
    }

    await this.authorBookRepository.removeOne(authorBook.id);

    console.log(`AuthorBook removed.`);
  }
}
