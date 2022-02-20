import express, { Request, Response } from 'express';
import { BookService } from 'src/app/domain/book/services/bookService';
import { CreateBookData, UpdateBookData } from 'src/app/domain/book/services/types';
import { RecordToInstanceTransformer, ResponseSender } from 'src/app/shared';
import { Service } from 'typedi';
import asyncHandler from 'express-async-handler';

const BOOKS_PATH = '/books';
const BOOKS_PATH_WITH_ID = `${BOOKS_PATH}/:id`;

@Service()
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

    ResponseSender.sendJsonDataWithCode(response, bookDto, 201);
  }

  public async findBook(request: Request, response: Response): Promise<void> {
    const id = parseInt(request.params.id);

    const bookDto = await this.bookService.findBook(id);

    ResponseSender.sendJsonData(response, bookDto);
  }

  public async updateBook(request: Request, response: Response): Promise<void> {
    const updateBookData = RecordToInstanceTransformer.transform(request.body, UpdateBookData);

    const id = parseInt(request.params.id);

    const bookDto = await this.bookService.updateBook(id, updateBookData);

    ResponseSender.sendJsonData(response, bookDto);
  }

  public async deleteBook(request: Request, response: Response): Promise<void> {
    const id = parseInt(request.params.id);

    await this.bookService.removeBook(id);

    ResponseSender.sendEmpty(response);
  }
}
