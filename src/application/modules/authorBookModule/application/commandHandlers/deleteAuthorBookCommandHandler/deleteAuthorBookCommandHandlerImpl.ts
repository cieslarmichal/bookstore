import { DeleteAuthorBookCommandHandler } from './deleteAuthorBookCommandHandler';
import {
  DeleteAuthorBookCommandHandlerPayload,
  deleteAuthorBookCommandHandlerPayloadSchema,
} from './payloads/deleteAuthorBookCommandHandlerPayload';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { AuthorBookNotFoundError } from '../../errors/authorBookNotFoundError';
import { authorBookSymbols } from '../../../symbols';
import { AuthorBookRepositoryFactory } from '../../repositories/authorBookRepository/authorBookRepositoryFactory';

@Injectable()
export class DeleteAuthorBookCommandHandlerImpl implements DeleteAuthorBookCommandHandler {
  public constructor(
    @Inject(authorBookSymbols.authorBookRepositoryFactory)
    private readonly authorBookRepositoryFactory: AuthorBookRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: DeleteAuthorBookCommandHandlerPayload): Promise<void> {
    const { unitOfWork, authorId, bookId } = Validator.validate(deleteAuthorBookCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting authorBook...', context: { authorId, bookId } });

    const entityManager = unitOfWork.getEntityManager();

    const authorBookRepository = this.authorBookRepositoryFactory.create(entityManager);

    const authorBook = await authorBookRepository.findAuthorBook({ authorId, bookId });

    if (!authorBook) {
      throw new AuthorBookNotFoundError({ authorId, bookId });
    }

    await authorBookRepository.deleteAuthorBook({ id: authorBook.id });

    this.loggerService.info({ message: 'AuthorBook deleted.', context: { authorBookId: authorBook.id } });
  }
}
