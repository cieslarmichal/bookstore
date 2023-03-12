import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { LoggerService } from '../../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { loggerSymbols } from '../../../../../../libs/logger/loggerSymbols';
import { UuidGenerator } from '../../../../../../libs/uuid/implementations/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/implementations/validator';
import { AuthorRepositoryFactory } from '../../../application/repositories/authorRepository/authorRepositoryFactory';
import { authorModuleSymbols } from '../../../authorModuleSymbols';
import { Author } from '../../../contracts/author';
import { AuthorService } from '../../../contracts/services/authorService/authorService';
import {
  CreateAuthorPayload,
  createAuthorPayloadSchema,
} from '../../../contracts/services/authorService/createAuthorPayload';
import {
  DeleteAuthorPayload,
  deleteAuthorPayloadSchema,
} from '../../../contracts/services/authorService/deleteAuthorPayload';
import {
  FindAuthorPayload,
  findAuthorPayloadSchema,
} from '../../../contracts/services/authorService/findAuthorPayload';
import {
  FindAuthorsByBookIdPayload,
  findAuthorsByBookIdPayloadSchema,
} from '../../../contracts/services/authorService/findAuthorsByBookIdPayload';
import {
  FindAuthorsPayload,
  findAuthorsPayloadSchema,
} from '../../../contracts/services/authorService/findAuthorsPayload';
import {
  UpdateAuthorPayload,
  updateAuthorPayloadSchema,
} from '../../../contracts/services/authorService/updateAuthorPayload';
import { AuthorNotFoundError } from '../../../infrastructure/errors/authorNotFoundError';

@Injectable()
export class AuthorServiceImpl implements AuthorService {
  public constructor(
    @Inject(authorModuleSymbols.authorRepositoryFactory)
    private readonly authorRepositoryFactory: AuthorRepositoryFactory,
    @Inject(loggerSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async createAuthor(input: CreateAuthorPayload): Promise<Author> {
    const { unitOfWork, draft } = Validator.validate(createAuthorPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating author...', context: { ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const author = await authorRepository.createOne({ id: UuidGenerator.generateUuid(), ...draft });

    this.loggerService.info({ message: 'Author created.', context: { authorId: author.id } });

    return author;
  }

  public async findAuthor(input: FindAuthorPayload): Promise<Author> {
    const { unitOfWork, authorId } = Validator.validate(findAuthorPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const author = await authorRepository.findOne({ id: authorId });

    if (!author) {
      throw new AuthorNotFoundError({ id: authorId });
    }

    return author;
  }

  public async findAuthors(input: FindAuthorsPayload): Promise<Author[]> {
    const { unitOfWork, filters, pagination } = Validator.validate(findAuthorsPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const authors = await authorRepository.findMany({ filters, pagination });

    return authors;
  }

  public async findAuthorsByBookId(input: FindAuthorsByBookIdPayload): Promise<Author[]> {
    const { unitOfWork, filters, pagination, bookId } = Validator.validate(findAuthorsByBookIdPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const authors = await authorRepository.findMany({ filters, pagination, bookId });

    return authors;
  }

  public async updateAuthor(input: UpdateAuthorPayload): Promise<Author> {
    const { unitOfWork, authorId, draft } = Validator.validate(updateAuthorPayloadSchema, input);

    this.loggerService.debug({ message: 'Updating author...', context: { authorId, ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const author = await authorRepository.updateOne({ id: authorId, draft });

    this.loggerService.info({ message: 'Author updated.', context: { authorId } });

    return author;
  }

  public async deleteAuthor(input: DeleteAuthorPayload): Promise<void> {
    const { unitOfWork, authorId } = Validator.validate(deleteAuthorPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting author...', context: { authorId } });

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    await authorRepository.deleteOne({ id: authorId });

    this.loggerService.info({ message: 'Author deleted.', context: { authorId } });
  }
}
