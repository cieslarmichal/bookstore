import { BookCategoryService } from './bookCategoryService';
import { CreateBookCategoryPayload, createBookCategoryPayloadSchema } from './payloads/createBookCategoryPayload';
import { DeleteBookCategoryPayload, deleteBookCategoryPayloadSchema } from './payloads/deleteBookCategoryPayload';
import {
  FindBooksByCategoryIdPayload,
  findBooksByCategoryIdPayloadSchema,
} from './payloads/findBooksByCategoryIdPayload';
import {
  FindCategoriesByBookIdPayload,
  findCategoriesByBookIdPayloadSchema,
} from './payloads/findCategoriesByBookIdPayload';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { BookService } from '../../../../bookModule/application/services/bookService/bookService';
import { bookModuleSymbols } from '../../../../bookModule/bookModuleSymbols';
import { Book } from '../../../../bookModule/domain/entities/book/book';
import { BookNotFoundError } from '../../../../bookModule/infrastructure/errors/bookNotFoundError';
import { CategoryService } from '../../../../categoryModule/application/services/categoryService/categoryService';
import { categoryModuleSymbols } from '../../../../categoryModule/categoryModuleSymbols';
import { Category } from '../../../../categoryModule/domain/entities/category/category';
import { CategoryNotFoundError } from '../../../../categoryModule/infrastructure/errors/categoryNotFoundError';
import { bookCategoryModuleSymbols } from '../../../bookCategoryModuleSymbols';
import { BookCategory } from '../../../domain/entities/bookCategory/bookCategory';
import { BookCategoryAlreadyExistsError } from '../../../infrastructure/errors/bookCategoryAlreadyExistsError';
import { BookCategoryNotFoundError } from '../../../infrastructure/errors/bookCategoryNotFoundError';
import { BookCategoryRepositoryFactory } from '../../repositories/bookCategoryRepository/bookCategoryRepositoryFactory';

@Injectable()
export class BookCategoryServiceImpl implements BookCategoryService {
  public constructor(
    @Inject(bookCategoryModuleSymbols.bookCategoryRepositoryFactory)
    private readonly bookCategoryRepositoryFactory: BookCategoryRepositoryFactory,
    @Inject(categoryModuleSymbols.categoryService)
    private readonly categoryService: CategoryService,
    @Inject(bookModuleSymbols.bookService)
    private readonly bookService: BookService,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async createBookCategory(input: CreateBookCategoryPayload): Promise<BookCategory> {
    const {
      unitOfWork,
      draft: { bookId, categoryId },
    } = Validator.validate(createBookCategoryPayloadSchema, input);

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

    const existingBookCategory = await bookCategoryRepository.findOne({ bookId, categoryId });

    if (existingBookCategory) {
      throw new BookCategoryAlreadyExistsError({ bookId, categoryId });
    }

    const bookCategory = await bookCategoryRepository.createOne({
      id: UuidGenerator.generateUuid(),
      bookId,
      categoryId,
    });

    this.loggerService.info({ message: 'BookCategory created.', context: { bookCategoryId: bookCategory.id } });

    return bookCategory;
  }

  public async findCategoriesByBookId(input: FindCategoriesByBookIdPayload): Promise<Category[]> {
    const { unitOfWork, bookId, filters, pagination } = Validator.validate(findCategoriesByBookIdPayloadSchema, input);

    const book = await this.bookService.findBook({ unitOfWork, bookId });

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    return this.categoryService.findCategoriesByBookId({ unitOfWork, bookId, filters, pagination });
  }

  public async findBooksByCategoryId(input: FindBooksByCategoryIdPayload): Promise<Book[]> {
    const { unitOfWork, categoryId, filters, pagination } = Validator.validate(
      findBooksByCategoryIdPayloadSchema,
      input,
    );

    const category = await this.categoryService.findCategory({ unitOfWork, categoryId });

    if (!category) {
      throw new CategoryNotFoundError({ id: categoryId });
    }

    return this.bookService.findBooksByCategoryId({ unitOfWork, categoryId, filters, pagination });
  }

  public async deleteBookCategory(input: DeleteBookCategoryPayload): Promise<void> {
    const { unitOfWork, bookId, categoryId } = Validator.validate(deleteBookCategoryPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting bookCategory...', context: { bookId, categoryId } });

    const entityManager = unitOfWork.getEntityManager();

    const bookCategoryRepository = this.bookCategoryRepositoryFactory.create(entityManager);

    const bookCategory = await bookCategoryRepository.findOne({ bookId, categoryId });

    if (!bookCategory) {
      throw new BookCategoryNotFoundError({ bookId, categoryId });
    }

    await bookCategoryRepository.deleteOne({ id: bookCategory.id });

    this.loggerService.info({ message: 'BookCategory deleted.', context: { bookCategoryId: bookCategory.id } });
  }
}
