import { CreateBookCategoryCommandHandler } from './createBookCategoryCommandHandler';
import {
  CreateBookCategoryCommandHandlerPayload,
  createBookCategoryCommandHandlerPayloadSchema,
} from './payloads/createBookCategoryCommandHandlerPayload';
import {
  CreateBookCategoryCommandHandlerResult,
  createBookCategoryCommandHandlerResultSchema,
} from './payloads/createBookCategoryCommandHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { BookNotFoundError } from '../../../../bookModule/application/errors/bookNotFoundError';
import { FindBookQueryHandler } from '../../../../bookModule/application/queryHandlers/findBookQueryHandler/findBookQueryHandler';
import { bookSymbols } from '../../../../bookModule/symbols';
import { CategoryNotFoundError } from '../../../../categoryModule/application/errors/categoryNotFoundError';
import { FindCategoryQueryHandler } from '../../../../categoryModule/application/queryHandlers/findCategoryQueryHandler/findCategoryQueryHandler';
import { categorySymbols } from '../../../../categoryModule/symbols';
import { bookCategorySymbols } from '../../../symbols';
import { BookCategoryAlreadyExistsError } from '../../errors/bookCategoryAlreadyExistsError';
import { BookCategoryRepositoryFactory } from '../../repositories/bookCategoryRepository/bookCategoryRepositoryFactory';

@Injectable()
export class CreateBookCategoryCommandHandlerImpl implements CreateBookCategoryCommandHandler {
  public constructor(
    @Inject(bookCategorySymbols.bookCategoryRepositoryFactory)
    private readonly bookCategoryRepositoryFactory: BookCategoryRepositoryFactory,
    @Inject(categorySymbols.findCategoryQueryHandler)
    private readonly findCategoryQueryHandler: FindCategoryQueryHandler,
    @Inject(bookSymbols.findBookQueryHandler)
    private readonly findBookQueryHandler: FindBookQueryHandler,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(
    input: CreateBookCategoryCommandHandlerPayload,
  ): Promise<CreateBookCategoryCommandHandlerResult> {
    const {
      unitOfWork,
      draft: { bookId, categoryId },
    } = Validator.validate(createBookCategoryCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating bookCategory...', context: { bookId, categoryId } });

    const { book } = await this.findBookQueryHandler.execute({ unitOfWork, bookId });

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    const { category } = await this.findCategoryQueryHandler.execute({ unitOfWork, categoryId });

    if (!category) {
      throw new CategoryNotFoundError({ id: categoryId });
    }

    const entityManager = unitOfWork.getEntityManager();

    const bookCategoryRepository = this.bookCategoryRepositoryFactory.create(entityManager);

    const existingBookCategory = await bookCategoryRepository.findBookCategory({ bookId, categoryId });

    if (existingBookCategory) {
      throw new BookCategoryAlreadyExistsError({ bookId, categoryId });
    }

    const bookCategory = await bookCategoryRepository.createBookCategory({
      id: UuidGenerator.generateUuid(),
      bookId,
      categoryId,
    });

    this.loggerService.info({ message: 'BookCategory created.', context: { bookCategoryId: bookCategory.id } });

    return Validator.validate(createBookCategoryCommandHandlerResultSchema, { bookCategory });
  }
}
