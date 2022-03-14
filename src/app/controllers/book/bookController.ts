import express, { NextFunction, Request, Response } from 'express';
import { BookService } from '../../domain/book/services/bookService';
import { CreateBookData, UpdateBookData } from '../../domain/book/services/types';
import { RecordToInstanceTransformer } from '../../shared';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { bookErrorMiddleware } from './middlewares';
import { AuthMiddleware, ControllerResponse, sendResponseMiddleware } from '../shared';
import {
  CreateBookBodyDto,
  CreateBookResponseData,
  CreateBookResponseDto,
  FindBookParamDto,
  FindBookResponseData,
  FindBookResponseDto,
  RemoveBookParamDto,
  RemoveBookResponseDto,
  UpdateBookBodyDto,
  UpdateBookParamDto,
  UpdateBookResponseData,
  UpdateBookResponseDto,
} from './dtos';
import { FindBooksResponseData, FindBooksResponseDto } from './dtos/findBooksDto';

const BOOKS_PATH = '/books';
const BOOKS_PATH_WITH_ID = `${BOOKS_PATH}/:id`;

export class BookController {
  public readonly router = express.Router();

  public constructor(private readonly bookService: BookService, authMiddleware: AuthMiddleware) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      BOOKS_PATH,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const createBookResponse = await this.createBook(request, response);
        response.locals.controllerResponse = createBookResponse;
        next();
      }),
    );
    this.router.get(
      BOOKS_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findBookResponse = await this.findBook(request, response);
        response.locals.controllerResponse = findBookResponse;
        next();
      }),
    );
    this.router.get(
      BOOKS_PATH,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findBooksResponse = await this.findBooks(request, response);
        response.locals.controllerResponse = findBooksResponse;
        next();
      }),
    );
    this.router.patch(
      BOOKS_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const updateBookResponse = await this.updateBook(request, response);
        response.locals.controllerResponse = updateBookResponse;
        next();
      }),
    );
    this.router.delete(
      BOOKS_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const deleteBookResponse = await this.deleteBook(request, response);
        response.locals.controllerResponse = deleteBookResponse;
        next();
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(bookErrorMiddleware);
  }

  public async createBook(request: Request, response: Response): Promise<ControllerResponse> {
    const createBookBodyDto = RecordToInstanceTransformer.strictTransform(request.body, CreateBookBodyDto);

    const createBookData = RecordToInstanceTransformer.strictTransform(createBookBodyDto, CreateBookData);

    const bookDto = await this.bookService.createBook(createBookData);

    const responseData = new CreateBookResponseData(bookDto);

    return new CreateBookResponseDto(responseData, StatusCodes.CREATED);
  }

  public async findBook(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.strictTransform(request.params, FindBookParamDto);

    const bookDto = await this.bookService.findBook(id);

    const responseData = new FindBookResponseData(bookDto);

    return new FindBookResponseDto(responseData, StatusCodes.OK);
  }

  public async findBooks(request: Request, response: Response): Promise<ControllerResponse> {
    const booksDto = await this.bookService.findBooks();

    const responseData = new FindBooksResponseData(booksDto);

    return new FindBooksResponseDto(responseData, StatusCodes.OK);
  }

  public async updateBook(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.strictTransform(request.params, UpdateBookParamDto);

    const updateBookBodyDto = RecordToInstanceTransformer.strictTransform(request.body, UpdateBookBodyDto);

    const updateBookData = RecordToInstanceTransformer.strictTransform(updateBookBodyDto, UpdateBookData);

    const bookDto = await this.bookService.updateBook(id, updateBookData);

    const responseData = new UpdateBookResponseData(bookDto);

    return new UpdateBookResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteBook(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.strictTransform(request.params, RemoveBookParamDto);

    await this.bookService.removeBook(id);

    return new RemoveBookResponseDto(StatusCodes.NO_CONTENT);
  }
}
