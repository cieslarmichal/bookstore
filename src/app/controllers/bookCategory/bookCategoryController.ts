import express, { NextFunction, Request, Response } from 'express';
import { BookCategoryService } from '../../domain/bookCategory/services/bookCategoryService';
import { CreateBookCategoryData, RemoveBookCategoryData } from '../../domain/bookCategory/services/types';
import { RecordToInstanceTransformer, UnitOfWorkFactory } from '../../shared';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { bookCategoryErrorMiddleware } from './middlewares';
import {
  CreateBookCategoryParamDto,
  CreateBookCategoryResponseData,
  CreateBookCategoryResponseDto,
  FindBookCategoriesParamDto,
  FindBookCategoriesResponseData,
  FindBookCategoriesResponseDto,
  FindCategoryBooksParamDto,
  FindCategoryBooksResponseData,
  FindCategoryBooksResponseDto,
  RemoveBookCategoryParamDto,
  RemoveBookCategoryResponseDto,
} from './dtos';
import { ControllerResponse } from '../shared/types/controllerResponse';
import { AuthMiddleware, FilterDataParser, PaginationDataParser, sendResponseMiddleware } from '../shared';
import { supportedFindBooksFieldsFilters } from '../book/dtos/findBooksDto';
import { supportedFindCategoriesFieldsFilters } from '../category/dtos';

const BOOK_CATEGORIES_PATH = '/books/:bookId/categories';
const BOOK_CATEGORIES_PATH_WITH_ID = `${BOOK_CATEGORIES_PATH}/:categoryId`;
const CATEGORY_BOOKS_PATH = '/categories/:categoryId/books';

export class BookCategoryController {
  public readonly router = express.Router();

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly bookCategoryService: BookCategoryService,
    authMiddleware: AuthMiddleware,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      BOOK_CATEGORIES_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const createBookCategoryResponse = await this.createBookCategory(request, response);
        response.locals.controllerResponse = createBookCategoryResponse;
        next();
      }),
    );
    this.router.delete(
      BOOK_CATEGORIES_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const deleteBookCategoryResponse = await this.deleteBookCategory(request, response);
        response.locals.controllerResponse = deleteBookCategoryResponse;
        next();
      }),
    );
    this.router.get(
      BOOK_CATEGORIES_PATH,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findBookCategoriesResponse = await this.findBookCategories(request, response);
        response.locals.controllerResponse = findBookCategoriesResponse;
        next();
      }),
    );
    this.router.get(
      CATEGORY_BOOKS_PATH,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findCategoryBooksResponse = await this.findCategoryBooks(request, response);
        response.locals.controllerResponse = findCategoryBooksResponse;
        next();
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(bookCategoryErrorMiddleware);
  }

  public async createBookCategory(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const createBookCategoryParamDto = RecordToInstanceTransformer.strictTransform(
      request.params,
      CreateBookCategoryParamDto,
    );

    const createBookCategoryData = RecordToInstanceTransformer.strictTransform(
      createBookCategoryParamDto,
      CreateBookCategoryData,
    );

    const bookCategoryDto = await unitOfWork.runInTransaction(async () => {
      const bookCategory = await this.bookCategoryService.createBookCategory(unitOfWork, createBookCategoryData);
      return bookCategory;
    });

    const responseData = new CreateBookCategoryResponseData(bookCategoryDto);

    return new CreateBookCategoryResponseDto(responseData, StatusCodes.CREATED);
  }

  public async findBookCategories(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { bookId } = RecordToInstanceTransformer.strictTransform(request.params, FindBookCategoriesParamDto);

    const filters = FilterDataParser.parse(request.query.filter as string, supportedFindCategoriesFieldsFilters);

    const paginationData = PaginationDataParser.parse(request.query);

    const categoriesDto = await unitOfWork.runInTransaction(async () => {
      const categories = await this.bookCategoryService.findCategoriesOfBook(
        unitOfWork,
        bookId,
        filters,
        paginationData,
      );

      return categories;
    });

    const responseData = new FindBookCategoriesResponseData(categoriesDto);

    return new FindBookCategoriesResponseDto(responseData, StatusCodes.OK);
  }

  public async findCategoryBooks(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { categoryId } = RecordToInstanceTransformer.strictTransform(request.params, FindCategoryBooksParamDto);

    const filters = FilterDataParser.parse(request.query.filter as string, supportedFindBooksFieldsFilters);

    const paginationData = PaginationDataParser.parse(request.query);

    const booksDto = await unitOfWork.runInTransaction(async () => {
      const books = await this.bookCategoryService.findBooksFromCategory(
        unitOfWork,
        categoryId,
        filters,
        paginationData,
      );

      return books;
    });

    const responseData = new FindCategoryBooksResponseData(booksDto);

    return new FindCategoryBooksResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteBookCategory(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const removeBookCategoryParamDto = RecordToInstanceTransformer.strictTransform(
      request.params,
      RemoveBookCategoryParamDto,
    );

    const removeBookCategoryData = RecordToInstanceTransformer.strictTransform(
      removeBookCategoryParamDto,
      RemoveBookCategoryData,
    );

    await unitOfWork.runInTransaction(async () => {
      await this.bookCategoryService.removeBookCategory(unitOfWork, removeBookCategoryData);
    });

    return new RemoveBookCategoryResponseDto(StatusCodes.NO_CONTENT);
  }
}
