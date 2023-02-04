import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../libs/uuid/implementations/uuidGenerator';
import { Author } from '../../../contracts/author';
import { AuthorRepositoryFactory } from '../../../contracts/factories/authorRepositoryFactory/authorRepositoryFactory';
import { AuthorService } from '../../../contracts/services/authorService/authorService';
import { CreateAuthorPayload } from '../../../contracts/services/authorService/createAuthorPayload';
import { DeleteAuthorPayload } from '../../../contracts/services/authorService/deleteAuthorPayload';
import { FindAuthorPayload } from '../../../contracts/services/authorService/findAuthorPayload';
import { FindAuthorsByBookIdPayload } from '../../../contracts/services/authorService/findAuthorsByBookIdPayload';
import { FindAuthorsPayload } from '../../../contracts/services/authorService/findAuthorsPayload';
import { UpdateAuthorPayload } from '../../../contracts/services/authorService/updateAuthorPayload';
import { AuthorNotFoundError } from '../../../errors/authorNotFoundError';

export class AuthorServiceImpl implements AuthorService {
  public constructor(
    private readonly authorRepositoryFactory: AuthorRepositoryFactory,
    private readonly loggerService: LoggerService,
  ) {}

  public async createAuthor(input: CreateAuthorPayload): Promise<Author> {
    const { unitOfWork, draft } = input;

    this.loggerService.debug({ message: 'Creating author...', context: { ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const author = await authorRepository.createOne({ id: UuidGenerator.generateUuid(), ...draft });

    this.loggerService.info({ message: 'Author created.', context: { authorId: author.id } });

    return author;
  }

  public async findAuthor(input: FindAuthorPayload): Promise<Author> {
    const { unitOfWork, authorId } = input;

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const author = await authorRepository.findOne({ id: authorId });

    if (!author) {
      throw new AuthorNotFoundError({ id: authorId });
    }

    return author;
  }

  public async findAuthors(input: FindAuthorsPayload): Promise<Author[]> {
    const { unitOfWork, filters, pagination } = input;

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const authors = await authorRepository.findMany({ filters, pagination });

    return authors;
  }

  public async findAuthorsByBookId(input: FindAuthorsByBookIdPayload): Promise<Author[]> {
    const { unitOfWork, filters, pagination, bookId } = input;

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const authors = await authorRepository.findMany({ filters, pagination, bookId });

    return authors;
  }

  public async updateAuthor(input: UpdateAuthorPayload): Promise<Author> {
    const { unitOfWork, authorId, draft } = input;

    this.loggerService.debug({ message: 'Updating author...', context: { authorId, ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const author = await authorRepository.updateOne({ id: authorId, draft });

    this.loggerService.info({ message: 'Author updated.', context: { authorId } });

    return author;
  }

  public async deleteAuthor(input: DeleteAuthorPayload): Promise<void> {
    const { unitOfWork, authorId } = input;

    this.loggerService.debug({ message: 'Deleting author...', context: { authorId } });

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    await authorRepository.deleteOne({ id: authorId });

    this.loggerService.info({ message: 'Author deleted.', context: { authorId } });
  }
}
