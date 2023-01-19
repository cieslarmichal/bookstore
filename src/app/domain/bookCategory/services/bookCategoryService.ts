import { Filter, PostgresUnitOfWork } from '../../../common';
import { LoggerService } from '../../../common/logger/services/loggerService';
import { BookDto } from '../../book/dtos';
import { BookNotFound } from '../../book/errors';
import { BookService } from '../../book/services/bookService';
import { CategoryDto } from '../../category/dtos';
import { CategoryNotFound } from '../../category/errors';
import { CategoryService } from '../../category/services/categoryService';
import { PaginationData } from '../../shared';
import { BookCategoryDto } from '../dtos';
import { BookCategoryAlreadyExists, BookCategoryNotFound } from '../errors';
import { BookCategoryRepositoryFactory } from '../repositories/bookCategoryRepositoryFactory';
import { CreateBookCategoryData, RemoveBookCategoryData } from './types';

export class BookCategoryService {
  public constructor(
    private readonly bookCategoryRepositoryFactory: BookCategoryRepositoryFactory,
    private readonly categoryService: CategoryService,
    private readonly bookService: BookService,
    private readonly loggerService: LoggerService,
  ) {}

  public async createBookCategory(
    unitOfWork: PostgresUnitOfWork,
    bookCategoryData: CreateBookCategoryData,
  ): Promise<BookCategoryDto> {
    const { bookId, categoryId } = bookCategoryData;

    this.loggerService.debug('Creating bookCategory...', { bookId, categoryId });

    const book = await this.bookService.findBook(unitOfWork, bookId);

    if (!book) {
      throw new BookNotFound({ id: bookId });
    }

    const category = await this.categoryService.findCategory(unitOfWork, categoryId);

    if (!category) {
      throw new CategoryNotFound({ id: categoryId });
    }

    const { entityManager } = unitOfWork;

    const bookCategoryRepository = this.bookCategoryRepositoryFactory.create(entityManager);

    const existingBookCategory = await bookCategoryRepository.findOne({ bookId, categoryId });

    if (existingBookCategory) {
      throw new BookCategoryAlreadyExists({ bookId, categoryId });
    }

    const bookCategory = await bookCategoryRepository.createOne(bookCategoryData);

    this.loggerService.info('BookCategory created.', { bookCategoryId: bookCategory.id });

    return bookCategory;
  }

  public async findCategoriesOfBook(
    unitOfWork: PostgresUnitOfWork,
    bookId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<CategoryDto[]> {
    const book = await this.bookService.findBook(unitOfWork, bookId);

    if (!book) {
      throw new BookNotFound({ id: bookId });
    }

    return this.categoryService.findCategoriesByBookId(unitOfWork, bookId, filters, paginationData);
  }

  public async findBooksFromCategory(
    unitOfWork: PostgresUnitOfWork,
    categoryId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<BookDto[]> {
    const category = await this.categoryService.findCategory(unitOfWork, categoryId);

    if (!category) {
      throw new CategoryNotFound({ id: categoryId });
    }

    return this.bookService.findBooksByCategoryId(unitOfWork, categoryId, filters, paginationData);
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
      throw new BookCategoryNotFound({ bookId, categoryId });
    }

    await bookCategoryRepository.removeOne(bookCategory.id);

    this.loggerService.info(`BookCategory removed.`, { bookCategoryId: bookCategory.id });
  }
}
