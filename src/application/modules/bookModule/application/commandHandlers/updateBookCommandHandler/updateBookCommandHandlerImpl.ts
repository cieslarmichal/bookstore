import {
  UpdateBookCommandHandlerPayload,
  updateBookCommandHandlerPayloadSchema,
} from './payloads/updateBookCommandHandlerPayload';
import {
  UpdateBookCommandHandlerResult,
  updateBookCommandHandlerResultSchema,
} from './payloads/updateBookCommandHandlerResult';
import { UpdateBookCommandHandler } from './updateBookCommandHandler';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { bookSymbols } from '../../../symbols';
import { BookRepositoryFactory } from '../../repositories/bookRepository/bookRepositoryFactory';

@Injectable()
export class UpdateBookCommandHandlerImpl implements UpdateBookCommandHandler {
  public constructor(
    @Inject(bookSymbols.bookRepositoryFactory)
    private readonly bookRepositoryFactory: BookRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: UpdateBookCommandHandlerPayload): Promise<UpdateBookCommandHandlerResult> {
    const { unitOfWork, bookId, draft } = Validator.validate(updateBookCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Updating book...', context: { bookId, ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const book = await bookRepository.updateBook({ id: bookId, draft });

    this.loggerService.info({ message: 'Book updated.', context: { bookId } });

    return Validator.validate(updateBookCommandHandlerResultSchema, { book });
  }
}
