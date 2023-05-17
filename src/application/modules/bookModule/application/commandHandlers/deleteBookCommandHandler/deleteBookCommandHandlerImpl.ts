import { DeleteBookCommandHandler } from './deleteBookCommandHandler';
import {
  DeleteBookCommandHandlerPayload,
  deleteBookCommandHandlerPayloadSchema,
} from './payloads/deleteBookCommandHandlerPayload';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { bookSymbols } from '../../../symbols';
import { BookRepositoryFactory } from '../../repositories/bookRepository/bookRepositoryFactory';

@Injectable()
export class DeleteBookCommandHandlerImpl implements DeleteBookCommandHandler {
  public constructor(
    @Inject(bookSymbols.bookRepositoryFactory)
    private readonly bookRepositoryFactory: BookRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: DeleteBookCommandHandlerPayload): Promise<void> {
    const { unitOfWork, bookId } = Validator.validate(deleteBookCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting book...', context: { bookId } });

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    await bookRepository.deleteBook({ id: bookId });

    this.loggerService.info({ message: 'Book deleted.', context: { bookId } });
  }
}
