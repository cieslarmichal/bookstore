/* eslint-disable @typescript-eslint/naming-convention */
import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatusCode } from '../../../../../common/http/httpStatusCode';
import { BookCategoryService } from '../../../../../domain/bookCategory/contracts/services/bookCategoryService/bookCategoryService';
import { UnitOfWorkFactory } from '../../../../../libs/unitOfWork/unitOfWorkFactory';
import { findBooksFilters } from '../../../../book/contracts/controllers/bookController/findBooksFilters';
import { findCategoriesFilters } from '../../../../category/contracts/controllers/categoryController/findCategoriesFilters';
import { FilterDataParser } from '../../../../common/filter/filterDataParser';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { PaginationDataParser } from '../../../../common/paginationData/paginationDataParser';
import { ControllerResponse } from '../../../../controllerResponse';
import { BookCategoryController } from '../../../contracts/controllers/bookCategoryController/bookCategoryController';
import { bookCategoryErrorMiddleware } from '../../middlewares/bookCategoryErrorMiddleware/bookCategoryErrorMiddleware';

const bookCategoriesEndpoint = '/books/:bookId/categories';
const bookCategoryEndpoint = `${bookCategoriesEndpoint}/:categoryId`;
const categoryBooksEndpoint = '/categories/:categoryId/books';

export class BookCategoryControllerImpl implements BookCategoryController {
  public readonly router = Router();

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly bookCategoryService: BookCategoryService,
    authMiddleware: AuthMiddleware,
    private filterDataParser: FilterDataParser,
    private paginationDataParser: PaginationDataParser,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      bookCategoryEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const createBookCategoryResponse = await this.createBookCategory(request, response);
        response.locals['controllerResponse'] = createBookCategoryResponse;
        next();
      }),
    );
    this.router.delete(
      bookCategoryEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const deleteBookCategoryResponse = await this.deleteBookCategory(request, response);
        response.locals['controllerResponse'] = deleteBookCategoryResponse;
        next();
      }),
    );
    this.router.get(
      bookCategoriesEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findBookCategoriesResponse = await this.findBookCategories(request, response);
        response.locals['controllerResponse'] = findBookCategoriesResponse;
        next();
      }),
    );
    this.router.get(
      categoryBooksEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findCategoryBooksResponse = await this.findCategoryBooks(request, response);
        response.locals['controllerResponse'] = findCategoryBooksResponse;
        next();
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(bookCategoryErrorMiddleware);
  }

  public async createBookCategory(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { bookId, categoryId } = request.params;

    const bookCategory = await unitOfWork.runInTransaction(async () => {
      return this.bookCategoryService.createBookCategory(unitOfWork, {
        bookId: bookId as string,
        categoryId: categoryId as string,
      });
    });

    return { data: { bookCategory }, statusCode: HttpStatusCode.created };
  }

  public async findBookCategories(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { bookId } = request.params;

    const filters = this.filterDataParser.parse(request.query['filter'] as string, findCategoriesFilters);

    const pagination = this.paginationDataParser.parse(request.query);

    const categories = await unitOfWork.runInTransaction(async () => {
      return this.bookCategoryService.findCategoriesOfBook(unitOfWork, bookId as string, filters, pagination);
    });

    return { data: { categories }, statusCode: HttpStatusCode.ok };
  }

  public async findCategoryBooks(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { categoryId } = request.params;

    const filters = this.filterDataParser.parse(request.query['filter'] as string, findBooksFilters);

    const pagination = this.paginationDataParser.parse(request.query);

    const books = await unitOfWork.runInTransaction(async () => {
      return this.bookCategoryService.findBooksFromCategory(unitOfWork, categoryId as string, filters, pagination);
    });

    return { data: { books }, statusCode: HttpStatusCode.ok };
  }

  public async deleteBookCategory(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { bookId, categoryId } = request.params;

    await unitOfWork.runInTransaction(async () => {
      await this.bookCategoryService.removeBookCategory(unitOfWork, {
        bookId: bookId as string,
        categoryId: categoryId as string,
      });
    });

    return { statusCode: HttpStatusCode.noContent };
  }
}
