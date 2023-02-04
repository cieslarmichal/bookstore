/* eslint-disable @typescript-eslint/naming-convention */
import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatusCode } from '../../../../../common/http/httpStatusCode';
import { Book } from '../../../../../domain/book/contracts/book';
import { BookCategory } from '../../../../../domain/bookCategory/contracts/bookCategory';
import { BookCategoryService } from '../../../../../domain/bookCategory/contracts/services/bookCategoryService/bookCategoryService';
import { Category } from '../../../../../domain/category/contracts/category';
import { UnitOfWorkFactory } from '../../../../../libs/unitOfWork/unitOfWorkFactory';
import { findBooksFilters } from '../../../../book/contracts/controllers/bookController/findBooksFilters';
import { findCategoriesFilters } from '../../../../category/contracts/controllers/categoryController/findCategoriesFilters';
import { FilterDataParser } from '../../../../common/filter/filterDataParser';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { PaginationDataParser } from '../../../../common/pagination/paginationDataParser';
import { ControllerResponse } from '../../../../controllerResponse';
import { LocalsName } from '../../../../localsName';
import { QueryParameterName } from '../../../../queryParameterName';
import { CreateBookCategoryPayload } from '../../../contracts/controllers/bookCategoryController/createBookCategoryPayload';
import { DeleteBookCategoryPayload } from '../../../contracts/controllers/bookCategoryController/deleteBookCategoryPayload';
import { FindBooksByCategoryIdPayload } from '../../../contracts/controllers/bookCategoryController/findBooksByCategoryIdPayload';
import { FindCategoriesByBookIdPayload } from '../../../contracts/controllers/bookCategoryController/findCategoriesByBookIdPayload';
import { bookCategoryErrorMiddleware } from '../../middlewares/bookCategoryErrorMiddleware/bookCategoryErrorMiddleware';

export class BookCategoryController {
  public readonly router = Router();
  private readonly bookCategoriesEndpoint = '/books/:bookId/categories';
  private readonly bookCategoryEndpoint = `${this.bookCategoriesEndpoint}/:categoryId`;
  private readonly categoryBooksEndpoint = '/categories/:categoryId/books';

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly bookCategoryService: BookCategoryService,
    authMiddleware: AuthMiddleware,
    private filterDataParser: FilterDataParser,
    private paginationDataParser: PaginationDataParser,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      this.bookCategoryEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { bookId, categoryId } = request.params;

        const bookCategory = await this.createBookCategory({
          bookId: bookId as string,
          categoryId: categoryId as string,
        });

        const controllerResponse: ControllerResponse = { data: { bookCategory }, statusCode: HttpStatusCode.created };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.bookCategoriesEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { bookId } = request.params;

        const filters = this.filterDataParser.parse(
          request.query[QueryParameterName.filter] as string,
          findCategoriesFilters,
        );

        const pagination = this.paginationDataParser.parse(request.query);

        const categories = await this.findCategoriesByBookId({
          bookId: bookId as string,
          filters,
          pagination,
        });

        const controllerResponse: ControllerResponse = { data: { categories }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.categoryBooksEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { categoryId } = request.params;

        const filters = this.filterDataParser.parse(
          request.query[QueryParameterName.filter] as string,
          findBooksFilters,
        );

        const pagination = this.paginationDataParser.parse(request.query);

        const books = await this.findBooksByCategoryId({
          categoryId: categoryId as string,
          filters,
          pagination,
        });

        const controllerResponse: ControllerResponse = { data: { books }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.delete(
      this.bookCategoryEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { bookId, categoryId } = request.params;

        await this.deleteBookCategory({
          bookId: bookId as string,
          categoryId: categoryId as string,
        });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.use(sendResponseMiddleware);

    this.router.use(bookCategoryErrorMiddleware);
  }

  private async createBookCategory(input: CreateBookCategoryPayload): Promise<BookCategory> {
    const { bookId, categoryId } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const bookCategory = await unitOfWork.runInTransaction(async () => {
      return this.bookCategoryService.createBookCategory({
        unitOfWork,
        draft: {
          bookId,
          categoryId,
        },
      });
    });

    return bookCategory;
  }

  private async findCategoriesByBookId(input: FindCategoriesByBookIdPayload): Promise<Category[]> {
    const { bookId, filters, pagination } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const categories = await unitOfWork.runInTransaction(async () => {
      return this.bookCategoryService.findCategoriesByBookId({ unitOfWork, bookId, filters, pagination });
    });

    return categories;
  }

  private async findBooksByCategoryId(input: FindBooksByCategoryIdPayload): Promise<Book[]> {
    const { categoryId, pagination, filters } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const books = await unitOfWork.runInTransaction(async () => {
      return this.bookCategoryService.findBooksByCategoryId({ unitOfWork, categoryId, filters, pagination });
    });

    return books;
  }

  private async deleteBookCategory(input: DeleteBookCategoryPayload): Promise<void> {
    const { bookId, categoryId } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      await this.bookCategoryService.deleteBookCategory({
        unitOfWork,
        bookId,
        categoryId,
      });
    });
  }
}
