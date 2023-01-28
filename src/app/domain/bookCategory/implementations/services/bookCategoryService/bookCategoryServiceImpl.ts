import { Filter } from '../../../../../common/filter/filter';
import { LoggerService } from '../../../../../libs/logger/loggerService';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { Book } from '../../../../book/contracts/book';
import { BookService } from '../../../../book/contracts/services/bookService/bookService';
import { BookNotFoundError } from '../../../../book/errors/bookNotFoundError';
import { Category } from '../../../../category/contracts/category';
import { CategoryService } from '../../../../category/contracts/services/categoryService/categoryService';
import { CategoryNotFoundError } from '../../../../category/errors/categoryNotFoundError';
import { PaginationData } from '../../../../common/paginationData';
import { BookCategory } from '../../../contracts/bookCategory';
import { BookCategoryRepositoryFactory } from '../../../contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { BookCategoryService } from '../../../contracts/services/bookCategoryService/bookCategoryService';
import { CreateBookCategoryData } from '../../../contracts/services/bookCategoryService/createBookCategoryData';
import { RemoveBookCategoryData } from '../../../contracts/services/bookCategoryService/removeBookCategoryData';
import { BookCategoryAlreadyExistsError } from '../../../errors/bookCategoryAlreadyExistsError';
import { BookCategoryNotFoundError } from '../../../errors/bookCategoryNotFoundError';

export class BookCategoryServiceImpl implements BookCategoryService {
  public constructor(
    private readonly bookCategoryRepositoryFactory: BookCategoryRepositoryFactory,
    private readonly categoryService: CategoryService,
    private readonly bookService: BookService,
    private readonly loggerService: LoggerService,
  ) {}

  public async createBookCategory(
    unitOfWork: PostgresUnitOfWork,
    bookCategoryData: CreateBookCategoryData,
  ): Promise<BookCategory> {
    const { bookId, categoryId } = bookCategoryData;

    this.loggerService.debug('Creating bookCategory...', { bookId, categoryId });

    const book = await this.bookService.findBook(unitOfWork, bookId);

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    const category = await this.categoryService.findCategory(unitOfWork, categoryId);

    if (!category) {
      throw new CategoryNotFoundError({ id: categoryId });
    }

    const { entityManager } = unitOfWork;

    const bookCategoryRepository = this.bookCategoryRepositoryFactory.create(entityManager);

    const existingBookCategory = await bookCategoryRepository.findOne({ bookId, categoryId });

    if (existingBookCategory) {
      throw new BookCategoryAlreadyExistsError({ bookId, categoryId });
    }

    const bookCategory = await bookCategoryRepository.createOne(bookCategoryData);

    this.loggerService.info('BookCategory created.', { bookCategoryId: bookCategory.id });

    return bookCategory;
  }

  public async findCategoriesOfBook(
    unitOfWork: PostgresUnitOfWork,
    bookId: string,
    filters: Filter[],
    pagination: PaginationData,
  ): Promise<Category[]> {
    const book = await this.bookService.findBook(unitOfWork, bookId);

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    return this.categoryService.findCategoriesByBookId(unitOfWork, bookId, filters, pagination);
  }

  public async findBooksFromCategory(
    unitOfWork: PostgresUnitOfWork,
    categoryId: string,
    filters: Filter[],
    pagination: PaginationData,
  ): Promise<Book[]> {
    const category = await this.categoryService.findCategory(unitOfWork, categoryId);

    if (!category) {
      throw new CategoryNotFoundError({ id: categoryId });
    }

    return this.bookService.findBooksByCategoryId(unitOfWork, categoryId, filters, pagination);
  }

  public async removeBookCategory(
    unitOfWork: PostgresUnitOfWork,
    bookCategoryData: RemoveBookCategoryData,
  ): Promise<void> {
    const { bookId, categoryId } = bookCategoryData;

    this.loggerService.debug('Removing bookCategory...', { bookId, categoryId });

    const { entityManager } = unitOfWork;

    const bookCategoryRepository = this.bookCategoryRepositoryFactory.create(entityManager);

    const bookCategory = await bookCategoryRepository.findOne({ bookId, categoryId });

    if (!bookCategory) {
      throw new BookCategoryNotFoundError({ bookId, categoryId });
    }

    await bookCategoryRepository.deleteOne(bookCategory.id);

    this.loggerService.info(`BookCategory removed.`, { bookCategoryId: bookCategory.id });
  }
}
