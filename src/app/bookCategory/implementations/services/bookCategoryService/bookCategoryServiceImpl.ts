import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { LoggerService } from '../../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { loggerSymbols } from '../../../../../../libs/logger/loggerSymbols';
import { UuidGenerator } from '../../../../../../libs/uuid/implementations/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/implementations/validator';
import { bookSymbols } from '../../../../book/bookSymbols';
import { Book } from '../../../../book/contracts/book';
import { BookService } from '../../../../book/contracts/services/bookService/bookService';
import { BookNotFoundError } from '../../../../book/errors/bookNotFoundError';
import { categoryModuleSymbols } from '../../../../categoryModule/categoryModuleSymbols';
import { Category } from '../../../../categoryModule/contracts/category';
import { CategoryService } from '../../../../categoryModule/contracts/services/categoryService/categoryService';
import { CategoryNotFoundError } from '../../../../categoryModule/infrastructure/errors/categoryNotFoundError';
import { bookCategorySymbols } from '../../../bookCategorySymbols';
import { BookCategory } from '../../../contracts/bookCategory';
import { BookCategoryRepositoryFactory } from '../../../contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { BookCategoryService } from '../../../contracts/services/bookCategoryService/bookCategoryService';
import {
  CreateBookCategoryPayload,
  createBookCategoryPayloadSchema,
} from '../../../contracts/services/bookCategoryService/createBookCategoryPayload';
import {
  DeleteBookCategoryPayload,
  deleteBookCategoryPayloadSchema,
} from '../../../contracts/services/bookCategoryService/deleteBookCategoryPayload';
import {
  FindBooksByCategoryIdPayload,
  findBooksByCategoryIdPayloadSchema,
} from '../../../contracts/services/bookCategoryService/findBooksByCategoryIdPayload';
import {
  FindCategoriesByBookIdPayload,
  findCategoriesByBookIdPayloadSchema,
} from '../../../contracts/services/bookCategoryService/findCategoriesByBookIdPayload';
import { BookCategoryAlreadyExistsError } from '../../../errors/bookCategoryAlreadyExistsError';
import { BookCategoryNotFoundError } from '../../../errors/bookCategoryNotFoundError';

@Injectable()
export class BookCategoryServiceImpl implements BookCategoryService {
  public constructor(
    @Inject(bookCategorySymbols.bookCategoryRepositoryFactory)
    private readonly bookCategoryRepositoryFactory: BookCategoryRepositoryFactory,
    @Inject(categoryModuleSymbols.categoryService)
    private readonly categoryService: CategoryService,
    @Inject(bookSymbols.bookService)
    private readonly bookService: BookService,
    @Inject(loggerSymbols.loggerService)
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