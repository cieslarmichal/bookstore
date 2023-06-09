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
import { AuthorNotFoundError } from '../../../../authorModule/application/errors/authorNotFoundError';
import { FindAuthorQueryHandler } from '../../../../authorModule/application/queryHandlers/findAuthorQueryHandler/findAuthorQueryHandler';
import { authorSymbols } from '../../../../authorModule/symbols';
import { BookNotFoundError } from '../../../../bookModule/application/errors/bookNotFoundError';
import { FindBookQueryHandler } from '../../../../bookModule/application/queryHandlers/findBookQueryHandler/findBookQueryHandler';
import { bookSymbols } from '../../../../bookModule/symbols';
import { authorBookSymbols } from '../../../symbols';
import { AuthorBookAlreadyExistsError } from '../../errors/authorBookAlreadyExistsError';
import { AuthorBookRepositoryFactory } from '../../repositories/authorBookRepository/authorBookRepositoryFactory';

@Injectable()
export class CreateAuthorBookCommandHandlerImpl implements CreateAuthorBookCommandHandler {
  public constructor(
    @Inject(authorBookSymbols.authorBookRepositoryFactory)
    private readonly authorBookRepositoryFactory: AuthorBookRepositoryFactory,
    @Inject(authorSymbols.findAuthorQueryHandler)
    private readonly findAuthorQueryHandler: FindAuthorQueryHandler,
    @Inject(bookSymbols.findBookQueryHandler)
    private readonly findBookQueryHandler: FindBookQueryHandler,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: CreateAuthorBookCommandHandlerPayload): Promise<CreateAuthorBookCommandHandlerResult> {
    const {
      unitOfWork,
      draft: { authorId, bookId },
    } = Validator.validate(createAuthorBookCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating authorBook...', context: { authorId, bookId } });

    const author = await this.findAuthorQueryHandler.execute({ unitOfWork, authorId });

    if (!author) {
      throw new AuthorNotFoundError({ id: authorId });
    }

    const book = await this.findBookQueryHandler.execute({ unitOfWork, bookId });

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
