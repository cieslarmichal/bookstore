import { LoggerService } from '../../../../../libs/logger/loggerService';
import { UuidGenerator } from '../../../../../libs/uuid/uuidGenerator';
import { Book } from '../../../../book/contracts/book';
import { BookService } from '../../../../book/contracts/services/bookService/bookService';
import { BookNotFoundError } from '../../../../book/errors/bookNotFoundError';
import { Category } from '../../../../category/contracts/category';
import { CategoryService } from '../../../../category/contracts/services/categoryService/categoryService';
import { CategoryNotFoundError } from '../../../../category/errors/categoryNotFoundError';
import { BookCategory } from '../../../contracts/bookCategory';
import { BookCategoryRepositoryFactory } from '../../../contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { BookCategoryService } from '../../../contracts/services/bookCategoryService/bookCategoryService';
import { CreateBookCategoryPayload } from '../../../contracts/services/bookCategoryService/createBookCategoryPayload';
import { DeleteBookCategoryPayload } from '../../../contracts/services/bookCategoryService/deleteBookCategoryPayload';
import { FindBooksByCategoryIdPayload } from '../../../contracts/services/bookCategoryService/findBooksByCategoryIdPayload';
import { FindCategoriesByBookIdPayload } from '../../../contracts/services/bookCategoryService/findCategoriesByBookIdPayload';
import { BookCategoryAlreadyExistsError } from '../../../errors/bookCategoryAlreadyExistsError';
import { BookCategoryNotFoundError } from '../../../errors/bookCategoryNotFoundError';

export class BookCategoryServiceImpl implements BookCategoryService {
  public constructor(
    private readonly bookCategoryRepositoryFactory: BookCategoryRepositoryFactory,
    private readonly categoryService: CategoryService,
    private readonly bookService: BookService,
    private readonly loggerService: LoggerService,
  ) {}

  public async createBookCategory(input: CreateBookCategoryPayload): Promise<BookCategory> {
    const {
      unitOfWork,
      draft: { bookId, categoryId },
    } = input;

    this.loggerService.debug('Creating bookCategory...', { bookId, categoryId });

    const book = await this.bookService.findBook({ unitOfWork, bookId });

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    const category = await this.categoryService.findCategory({ unitOfWork, categoryId });

    if (!category) {
      throw new CategoryNotFoundError({ id: categoryId });
    }

    const { entityManager } = unitOfWork;

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

    this.loggerService.info('BookCategory created.', { bookCategoryId: bookCategory.id });

    return bookCategory;
  }

  public async findCategoriesByBookId(input: FindCategoriesByBookIdPayload): Promise<Category[]> {
    const { unitOfWork, bookId, filters, pagination } = input;

    const book = await this.bookService.findBook({ unitOfWork, bookId });

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    return this.categoryService.findCategoriesByBookId({ unitOfWork, bookId, filters, pagination });
  }

  public async findBooksByCategoryId(input: FindBooksByCategoryIdPayload): Promise<Book[]> {
    const { unitOfWork, categoryId, filters, pagination } = input;

    const category = await this.categoryService.findCategory({ unitOfWork, categoryId });

    if (!category) {
      throw new CategoryNotFoundError({ id: categoryId });
    }

    return this.bookService.findBooksByCategoryId({ unitOfWork, categoryId, filters, pagination });
  }

  public async deleteBookCategory(input: DeleteBookCategoryPayload): Promise<void> {
    const { unitOfWork, bookId, categoryId } = input;

    this.loggerService.debug('Deleting bookCategory...', { bookId, categoryId });

    const { entityManager } = unitOfWork;

    const bookCategoryRepository = this.bookCategoryRepositoryFactory.create(entityManager);

    const bookCategory = await bookCategoryRepository.findOne({ bookId, categoryId });

    if (!bookCategory) {
      throw new BookCategoryNotFoundError({ bookId, categoryId });
    }

    await bookCategoryRepository.deleteOne({ id: bookCategory.id });

    this.loggerService.info('BookCategory deleted.', { bookCategoryId: bookCategory.id });
  }
}
