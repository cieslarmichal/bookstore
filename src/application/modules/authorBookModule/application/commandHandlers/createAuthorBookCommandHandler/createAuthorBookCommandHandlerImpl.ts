import { CreateAuthorBookCommandHandler } from './createAuthorBookCommandHandler';
import {
  CreateAuthorBookCommandHandlerPayload,
  createAuthorBookCommandHandlerPayloadSchema,
} from './payloads/createAuthorBookCommandHandlerPayload';
import {
  CreateAuthorBookCommandHandlerResult,
  createAuthorBookCommandHandlerResultSchema,
} from './payloads/createAuthorBookCommandHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { AuthorService } from '../../../../authorModule/application/services/authorService/authorService';
import { AuthorNotFoundError } from '../../../../authorModule/infrastructure/errors/authorNotFoundError';
import { authorModuleSymbols } from '../../../../authorModule/symbols';
import { BookService } from '../../../../bookModule/application/services/bookService/bookService';
import { bookModuleSymbols } from '../../../../bookModule/bookModuleSymbols';
import { BookNotFoundError } from '../../../../bookModule/infrastructure/errors/bookNotFoundError';
import { AuthorBookAlreadyExistsError } from '../../../infrastructure/errors/authorBookAlreadyExistsError';
import { authorBookSymbols } from '../../../symbols';
import { AuthorBookRepositoryFactory } from '../../repositories/authorBookRepository/authorBookRepositoryFactory';

@Injectable()
export class CreateAuthorBookCommandHandlerImpl implements CreateAuthorBookCommandHandler {
  public constructor(
    @Inject(authorBookSymbols.authorBookRepositoryFactory)
    private readonly authorBookRepositoryFactory: AuthorBookRepositoryFactory,
    @Inject(authorModuleSymbols.authorService)
    private readonly authorService: AuthorService,
    @Inject(bookModuleSymbols.bookService)
    private readonly bookService: BookService,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: CreateAuthorBookCommandHandlerPayload): Promise<CreateAuthorBookCommandHandlerResult> {
    const {
      unitOfWork,
      draft: { authorId, bookId },
    } = Validator.validate(createAuthorBookCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating authorBook...', context: { authorId, bookId } });

    const author = await this.authorService.findAuthor({ unitOfWork, authorId });

    if (!author) {
      throw new AuthorNotFoundError({ id: authorId });
    }

    const book = await this.bookService.findBook({ unitOfWork, bookId });

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    const entityManager = unitOfWork.getEntityManager();

    const authorBookRepository = this.authorBookRepositoryFactory.create(entityManager);

    const existingAuthorBook = await authorBookRepository.findAuthorBook({ authorId, bookId });

    if (existingAuthorBook) {
      throw new AuthorBookAlreadyExistsError({ authorId, bookId });
    }

    const authorBook = await authorBookRepository.createAuthorBook({
      id: UuidGenerator.generateUuid(),
      authorId,
      bookId,
    });

    this.loggerService.info({ message: 'AuthorBook created.', context: { authorBookId: authorBook.id } });

    return Validator.validate(createAuthorBookCommandHandlerResultSchema, { authorBook });
  }
}
