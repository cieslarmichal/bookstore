import { NotFoundError } from '../../../shared';
import { AuthorDto } from '../dtos';
import { AuthorRepository } from '../repositories/authorRepository';
import { CreateAuthorData, UpdateAuthorData } from './types';

export class AuthorService {
  public constructor(private readonly authorRepository: AuthorRepository) {}

  public async createAuthor(authorData: CreateAuthorData): Promise<AuthorDto> {
    console.log('Creating author...');

    const author = await this.authorRepository.createOne(authorData);

    console.log('Author created.');

    return author;
  }

  public async findAuthor(authorId: number): Promise<AuthorDto> {
    const author = await this.authorRepository.findOneById(authorId);

    if (!author) {
      throw new NotFoundError(`Author with id ${authorId} not found`);
    }

    return author;
  }

  public async updateAuthor(authorId: number, authorData: UpdateAuthorData): Promise<AuthorDto> {
    console.log(`Updating author with id ${authorId}...`);

    const author = await this.authorRepository.updateOne(authorId, authorData);

    console.log(`Author with id ${authorId} updated.`);

    return author;
  }

  public async removeAuthor(authorId: number): Promise<void> {
    console.log(`Removing author with id ${authorId}...`);

    await this.authorRepository.removeOne(authorId);

    console.log(`Author with id ${authorId} removed.`);
  }
}
