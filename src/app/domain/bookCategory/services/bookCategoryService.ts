import { Filter } from '../../../shared';
import { LoggerService } from '../../../shared/logger/services/loggerService';
import { BookDto } from '../../book/dtos';
import { BookNotFound } from '../../book/errors';
import { BookService } from '../../book/services/bookService';
import { CategoryDto } from '../../category/dtos';
import { CategoryNotFound } from '../../category/errors';
import { CategoryService } from '../../category/services/categoryService';
import { PaginationData } from '../../shared';
import { BookCategoryDto } from '../dtos';
import { BookCategoryAlreadyExists, BookCategoryNotFound } from '../errors';
import { BookCategoryRepository } from '../repositories/bookCategoryRepository';
import { CreateBookCategoryData, RemoveBookCategoryData } from './types';

export class BookCategoryService {
  public constructor(
    private readonly bookCategoryRepository: BookCategoryRepository,
    private readonly categoryService: CategoryService,
    private readonly bookService: BookService,
    private readonly loggerService: LoggerService,
  ) {}

  public async createBookCategory(bookCategoryData: CreateBookCategoryData): Promise<BookCategoryDto> {
    const { bookId, categoryId } = bookCategoryData;

    this.loggerService.debug('Creating bookCategory...', { bookId, categoryId });

    const book = await this.bookService.findBook(bookId);

    if (!book) {
      throw new BookNotFound({ id: bookId });
    }

    const category = await this.categoryService.findCategory(categoryId);

    if (!category) {
      throw new CategoryNotFound({ id: categoryId });
    }

    const existingBookCategory = await this.bookCategoryRepository.findOne({ bookId, categoryId });

    if (existingBookCategory) {
      throw new BookCategoryAlreadyExists({ bookId, categoryId });
    }

    const bookCategory = await this.bookCategoryRepository.createOne(bookCategoryData);

    this.loggerService.info('BookCategory created.', { bookCategoryId: bookCategory.id });

    return bookCategory;
  }

  public async findCategoriesOfBook(
    bookId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<CategoryDto[]> {
    const book = await this.bookService.findBook(bookId);

    if (!book) {
      throw new BookNotFound({ id: bookId });
    }

    return this.categoryService.findCategoriesByBookId(bookId, filters, paginationData);
  }

  public async findBooksFromCategory(
    categoryId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<BookDto[]> {
    const category = await this.categoryService.findCategory(categoryId);

    if (!category) {
      throw new CategoryNotFound({ id: categoryId });
    }

    return this.bookService.findBooksByCategoryId(categoryId, filters, paginationData);
  }

  public async removeBookCategory(bookCategoryData: RemoveBookCategoryData): Promise<void> {
    const { bookId, categoryId } = bookCategoryData;

    this.loggerService.debug('Removing bookCategory...', { bookId, categoryId });

    const bookCategory = await this.bookCategoryRepository.findOne({ bookId, categoryId });

    if (!bookCategory) {
      throw new BookCategoryNotFound({ bookId, categoryId });
    }

    await this.bookCategoryRepository.removeOne(bookCategory.id);

    this.loggerService.info(`BookCategory removed.`, { bookCategoryId: bookCategory.id });
  }
}
