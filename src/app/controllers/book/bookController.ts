import express, { NextFunction, Request, Response } from 'express';
import { BookService } from '../../domain/book/services/bookService';
import { CreateBookData, UpdateBookData } from '../../domain/book/services/types';
import { RecordToInstanceTransformer } from '../../shared';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { bookErrorMiddleware } from './middlewares';
import { ControllerResponse, sendResponseMiddleware } from '../shared';
import {
  CreateBookBodyDto,
  CreateBookResponseData,
  CreateBookResponseDto,
  FindBookResponseData,
  FindBookResponseDto,
  RemoveBookResponseDto,
  UpdateBookBodyDto,
  UpdateBookResponseData,
  UpdateBookResponseDto,
} from './dtos';

const BOOKS_PATH = '/books';
const BOOKS_PATH_WITH_ID = `${BOOKS_PATH}/:id`;

export class BookController {
  public readonly router = express.Router();

  public constructor(private readonly bookService: BookService) {
    this.router.post(
      BOOKS_PATH,
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const createBookResponse = await this.createBook(request, response);
        response.locals.controllerResponse = createBookResponse;
        next();
      }),
    );
    this.router.get(
      BOOKS_PATH_WITH_ID,
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findBookResponse = await this.findBook(request, response);
        response.locals.controllerResponse = findBookResponse;
        next();
      }),
    );
    this.router.patch(
      BOOKS_PATH_WITH_ID,
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const updateBookResponse = await this.updateBook(request, response);
        response.locals.controllerResponse = updateBookResponse;
        next();
      }),
    );
    this.router.delete(
      BOOKS_PATH_WITH_ID,
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
    const createBookBodyDto = RecordToInstanceTransformer.transform(request.body, CreateBookBodyDto);

    const createBookData = RecordToInstanceTransformer.transform(createBookBodyDto, CreateBookData);

    const bookDto = await this.bookService.createBook(createBookData);

    const responseData = new CreateBookResponseData(bookDto);

    return new CreateBookResponseDto(responseData, StatusCodes.CREATED);
  }

  public async findBook(request: Request, response: Response): Promise<ControllerResponse> {
    const bookDto = await this.bookService.findBook(request.params.id);

    const responseData = new FindBookResponseData(bookDto);

    return new FindBookResponseDto(responseData, StatusCodes.OK);
  }

  public async updateBook(request: Request, response: Response): Promise<ControllerResponse> {
    const updateBookBodyDto = RecordToInstanceTransformer.transform(request.body, UpdateBookBodyDto);

    const updateBookData = RecordToInstanceTransformer.transform(updateBookBodyDto, UpdateBookData);

    const bookDto = await this.bookService.updateBook(request.params.id, updateBookData);

    const responseData = new UpdateBookResponseData(bookDto);

    return new UpdateBookResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteBook(request: Request, response: Response): Promise<ControllerResponse> {
    await this.bookService.removeBook(request.params.id);

    return new RemoveBookResponseDto(StatusCodes.OK);
  }
}
