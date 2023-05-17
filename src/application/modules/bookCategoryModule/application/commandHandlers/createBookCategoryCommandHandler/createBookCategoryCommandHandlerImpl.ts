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
import { BookService } from '../../../../bookModule/application/services/bookService/bookService';
import { BookNotFoundError } from '../../../../bookModule/infrastructure/errors/bookNotFoundError';
import { bookSymbols } from '../../../../bookModule/symbols';
import { CategoryService } from '../../../../categoryModule/application/services/categoryService/categoryService';
import { categoryModuleSymbols } from '../../../../categoryModule/categoryModuleSymbols';
import { CategoryNotFoundError } from '../../../../categoryModule/infrastructure/errors/categoryNotFoundError';
import { BookCategoryAlreadyExistsError } from '../../../infrastructure/errors/bookCategoryAlreadyExistsError';
import { bookCategorySymbols } from '../../../symbols';
import { BookCategoryRepositoryFactory } from '../../repositories/bookCategoryRepository/bookCategoryRepositoryFactory';

@Injectable()
export class CreateBookCategoryCommandHandlerImpl implements CreateBookCategoryCommandHandler {
  public constructor(
    @Inject(bookCategorySymbols.bookCategoryRepositoryFactory)
    private readonly bookCategoryRepositoryFactory: BookCategoryRepositoryFactory,
    @Inject(categoryModuleSymbols.categoryService)
    private readonly categoryService: CategoryService,
    @Inject(bookSymbols.bookService)
    private readonly bookService: BookService,
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

    const book = await this.bookService.findBook({ unitOfWork, bookId });

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    const category = await this.categoryService.findCategory({ unitOfWork, categoryId });

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
