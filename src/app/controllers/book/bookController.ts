import express, { Request, Response } from 'express';
import { BookService } from '../../domain/book/services/bookService';
import { CreateBookData, UpdateBookData } from '../../domain/book/services/types';
import { RecordToInstanceTransformer } from '../../shared';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { bookErrorMiddleware } from './middlewares';
import { ControllerResponse, sendResponseMiddleware } from '../shared';

const BOOKS_PATH = '/books';
const BOOKS_PATH_WITH_ID = `${BOOKS_PATH}/:id`;

export class BookController {
  public readonly router = express.Router();

  public constructor(private readonly bookService: BookService) {
    this.router.post(
      BOOKS_PATH,
      asyncHandler((request: Request, response: Response) => {
        this.createBook(request, response);
      }),
    );
    this.router.get(
      BOOKS_PATH_WITH_ID,
      asyncHandler((request: Request, response: Response) => {
        this.findBook(request, response);
      }),
    );
    this.router.patch(
      BOOKS_PATH_WITH_ID,
      asyncHandler((request: Request, response: Response) => {
        this.updateBook(request, response);
      }),
    );
    this.router.delete(
      BOOKS_PATH_WITH_ID,
      asyncHandler((request: Request, response: Response) => {
        this.deleteBook(request, response);
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(bookErrorMiddleware);
  }

  public async createBook(request: Request, response: Response): Promise<ControllerResponse> {
    const createBookData = RecordToInstanceTransformer.transform(request.body, CreateBookData);

    const bookDto = await this.bookService.createBook(createBookData);

    response.status(StatusCodes.CREATED).send(bookDto);
  }

  public async findBook(request: Request, response: Response): Promise<ControllerResponse> {
    const bookDto = await this.bookService.findBook(request.params.id);

    response.status(StatusCodes.OK).send(bookDto);
  }

  public async updateBook(request: Request, response: Response): Promise<ControllerResponse> {
    const updateBookData = RecordToInstanceTransformer.transform(request.body, UpdateBookData);

    const bookDto = await this.bookService.updateBook(request.params.id, updateBookData);

    response.status(StatusCodes.OK).send(bookDto);
  }

  public async deleteBook(request: Request, response: Response): Promise<ControllerResponse> {
    await this.bookService.removeBook(request.params.id);

    response.status(StatusCodes.OK).send();
  }
}
