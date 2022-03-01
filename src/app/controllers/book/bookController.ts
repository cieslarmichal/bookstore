import express, { Request, Response } from 'express';
import { BookService } from '../../domain/book/services/bookService';
import { CreateBookData, UpdateBookData } from '../../domain/book/services/types';
import { RecordToInstanceTransformer } from '../../shared';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

const BOOKS_PATH = '/books';
const BOOKS_PATH_WITH_ID = `${BOOKS_PATH}/:id`;

export class BookController {
  public readonly router = express.Router();

  public constructor(private readonly bookService: BookService) {
    this.router.post(
      BOOKS_PATH,
      asyncHandler((request: Request, response: Response) => this.createBook(request, response)),
    );
    this.router.get(
      BOOKS_PATH_WITH_ID,
      asyncHandler((request: Request, response: Response) => this.findBook(request, response)),
    );
    this.router.patch(
      BOOKS_PATH_WITH_ID,
      asyncHandler((request: Request, response: Response) => this.updateBook(request, response)),
    );
    this.router.delete(
      BOOKS_PATH_WITH_ID,
      asyncHandler((request: Request, response: Response) => this.deleteBook(request, response)),
    );
  }

  public async createBook(request: Request, response: Response): Promise<void> {
    const createBookData = RecordToInstanceTransformer.transform(request.body, CreateBookData);

    const bookDto = await this.bookService.createBook(createBookData);

    response.setHeader('Content-Type', 'application/json');
    response.status(StatusCodes.CREATED).send(bookDto);
  }

  public async findBook(request: Request, response: Response): Promise<void> {
    const id = parseInt(request.params.id);

    const bookDto = await this.bookService.findBook(id);

    response.setHeader('Content-Type', 'application/json');
    response.status(StatusCodes.OK).send(bookDto);
  }

  public async updateBook(request: Request, response: Response): Promise<void> {
    const updateBookData = RecordToInstanceTransformer.transform(request.body, UpdateBookData);

    const id = parseInt(request.params.id);

    const bookDto = await this.bookService.updateBook(id, updateBookData);

    response.setHeader('Content-Type', 'application/json');
    response.status(StatusCodes.OK).send(bookDto);
  }

  public async deleteBook(request: Request, response: Response): Promise<void> {
    const id = parseInt(request.params.id);

    await this.bookService.removeBook(id);

    response.status(StatusCodes.OK).send();
  }
}
