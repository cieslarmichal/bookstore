import { CreateBookCommandHandler } from './createBookCommandHandler';
import {
  CreateBookCommandHandlerPayload,
  createBookCommandHandlerPayloadSchema,
} from './payloads/createBookCommandHandlerPayload';
import {
  CreateBookCommandHandlerResult,
  createBookCommandHandlerResultSchema,
} from './payloads/createBookCommandHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { bookSymbols } from '../../../symbols';
import { BookRepositoryFactory } from '../../repositories/bookRepository/bookRepositoryFactory';

@Injectable()
export class CreateBookCommandHandlerImpl implements CreateBookCommandHandler {
  public constructor(
    @Inject(bookSymbols.bookRepositoryFactory)
    private readonly bookRepositoryFactory: BookRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: CreateBookCommandHandlerPayload): Promise<CreateBookCommandHandlerResult> {
    const { unitOfWork, draft } = Validator.validate(createBookCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating book...', context: { ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const book = await bookRepository.createBook({ id: UuidGenerator.generateUuid(), ...draft });

    this.loggerService.info({ message: 'Book created.', context: { bookId: book.id } });

    return Validator.validate(createBookCommandHandlerResultSchema, { book });
  }
}
