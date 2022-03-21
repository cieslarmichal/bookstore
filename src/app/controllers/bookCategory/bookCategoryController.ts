import express, { NextFunction, Request, Response } from 'express';
import { BookCategoryService } from '../../domain/bookCategory/services/bookCategoryService';
import { CreateBookCategoryData, RemoveBookCategoryData } from '../../domain/bookCategory/services/types';
import { RecordToInstanceTransformer } from '../../shared';
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
import { AuthMiddleware, PaginationDataParser, sendResponseMiddleware } from '../shared';
import { FindBooksQueryDto } from '../book/dtos/findBooksDto';
import { FindCategoriesQueryDto } from '../category/dtos';

const BOOK_CATEGORIES_PATH = '/books/:bookId/categories';
const BOOK_CATEGORIES_PATH_WITH_ID = `${BOOK_CATEGORIES_PATH}/:categoryId`;
const CATEGORY_BOOKS_PATH = '/categories/:categoryId/books';

export class BookCategoryController {
  public readonly router = express.Router();

  public constructor(private readonly bookCategoryService: BookCategoryService, authMiddleware: AuthMiddleware) {
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
    const createBookCategoryParamDto = RecordToInstanceTransformer.strictTransform(
      request.params,
      CreateBookCategoryParamDto,
    );

    const createBookCategoryData = RecordToInstanceTransformer.strictTransform(
      createBookCategoryParamDto,
      CreateBookCategoryData,
    );

    const bookCategoryDto = await this.bookCategoryService.createBookCategory(createBookCategoryData);

    const responseData = new CreateBookCategoryResponseData(bookCategoryDto);

    return new CreateBookCategoryResponseDto(responseData, StatusCodes.CREATED);
  }

  public async findBookCategories(request: Request, response: Response): Promise<ControllerResponse> {
    const { bookId } = RecordToInstanceTransformer.strictTransform(request.params, FindBookCategoriesParamDto);

    const categoriesQueryDto = RecordToInstanceTransformer.transform(request.query, FindCategoriesQueryDto);

    const paginationData = PaginationDataParser.parse(request.query);

    const categoriesDto = await this.bookCategoryService.findCategoriesOfBook(
      bookId,
      categoriesQueryDto,
      paginationData,
    );

    const responseData = new FindBookCategoriesResponseData(categoriesDto);

    return new FindBookCategoriesResponseDto(responseData, StatusCodes.OK);
  }

  public async findCategoryBooks(request: Request, response: Response): Promise<ControllerResponse> {
    const { categoryId } = RecordToInstanceTransformer.strictTransform(request.params, FindCategoryBooksParamDto);

    const booksQueryDto = RecordToInstanceTransformer.transform(request.query, FindBooksQueryDto);

    const paginationData = PaginationDataParser.parse(request.query);

    const booksDto = await this.bookCategoryService.findBooksFromCategory(categoryId, booksQueryDto, paginationData);

    const responseData = new FindCategoryBooksResponseData(booksDto);

    return new FindCategoryBooksResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteBookCategory(request: Request, response: Response): Promise<ControllerResponse> {
    const removeBookCategoryParamDto = RecordToInstanceTransformer.strictTransform(
      request.params,
      RemoveBookCategoryParamDto,
    );

    const removeBookCategoryData = RecordToInstanceTransformer.strictTransform(
      removeBookCategoryParamDto,
      RemoveBookCategoryData,
    );

    await this.bookCategoryService.removeBookCategory(removeBookCategoryData);

    return new RemoveBookCategoryResponseDto(StatusCodes.NO_CONTENT);
  }
}
