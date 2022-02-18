import express, { Request, Response } from 'express';
import { BookService } from 'src/app/domain/book/services/bookService';
import {
  CreateBookData,
  UpdateBookData,
} from 'src/app/domain/book/services/types';
import { RecordToInstanceTransformer } from 'src/app/shared';
import { Service } from 'typedi';
import asyncHandler from 'express-async-handler';

const BOOKS_PATH = '/books';

@Service()
export class BookController {
  public readonly router = express.Router();

  public constructor(private readonly bookService: BookService) {
    this.router.post(
      BOOKS_PATH,
      asyncHandler((request: Request, response: Response) =>
        this.createBook(request, response),
      ),
    );
    this.router.get(
      BOOKS_PATH,
      asyncHandler((request: Request, response: Response) =>
        this.findBook(request, response),
      ),
    );
    this.router.put(
      BOOKS_PATH,
      asyncHandler((request: Request, response: Response) =>
        this.updateBook(request, response),
      ),
    );
    this.router.delete(
      BOOKS_PATH,
      asyncHandler((request: Request, response: Response) =>
        this.deleteBook(request, response),
      ),
    );
  }

  public async createBook(request: Request, response: Response): Promise<void> {
    const createBookData = RecordToInstanceTransformer.transform(
      request.body,
      CreateBookData,
    );

    const bookDto = await this.bookService.createBook(createBookData);

    response.status(201).send(bookDto);
  }

  public async findBook(request: Request, response: Response): Promise<void> {
    const id = request.params.id;

    const bookDto = await this.bookService.findBook(id);

    response.send(bookDto);
  }

  public async updateBook(request: Request, response: Response): Promise<void> {
    const updateBookData = RecordToInstanceTransformer.transform(
      request.body,
      UpdateBookData,
    );

    const id = request.params.id;

    const bookDto = await this.bookService.updateBook(id, updateBookData);

    response.send(bookDto);
  }

  public async deleteBook(request: Request, response: Response): Promise<void> {
    const id = request.params.id;

    await this.bookService.removeBook(id);

    response.send();
  }
}
