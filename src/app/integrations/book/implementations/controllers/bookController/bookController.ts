/* eslint-disable @typescript-eslint/naming-convention */
import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatusCode } from '../../../../../common/http/httpStatusCode';
import { Book } from '../../../../../domain/book/contracts/book';
import { BookService } from '../../../../../domain/book/contracts/services/bookService/bookService';
import { CreateBookDraft } from '../../../../../domain/book/contracts/services/bookService/createBookDraft';
import { UpdateBookDraft } from '../../../../../domain/book/contracts/services/bookService/updateBookDraft';
import { UnitOfWorkFactory } from '../../../../../libs/unitOfWork/unitOfWorkFactory';
import { FilterDataParser } from '../../../../common/filter/filterDataParser';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { PaginationDataParser } from '../../../../common/pagination/paginationDataParser';
import { ControllerResponse } from '../../../../controllerResponse';
import { LocalsName } from '../../../../localsName';
import { QueryParameterName } from '../../../../queryParameterName';
import { CreateBookPayload } from '../../../contracts/controllers/bookController/createBookPayload';
import { DeleteBookPayload } from '../../../contracts/controllers/bookController/deleteBookPayload';
import { FindBookPayload } from '../../../contracts/controllers/bookController/findBookPayload';
import { findBooksFilters } from '../../../contracts/controllers/bookController/findBooksFilters';
import { FindBooksPayload } from '../../../contracts/controllers/bookController/findBooksPayload';
import { UpdateBookPayload } from '../../../contracts/controllers/bookController/updateBookPayload';
import { bookErrorMiddleware } from '../../middlewares/bookErrorMiddleware/bookErrorMiddleware';

export class BookController {
  public readonly router = Router();
  private readonly booksEndpoint = '/books';
  private readonly bookEndpoint = `${this.booksEndpoint}/:id`;

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly bookService: BookService,
    authMiddleware: AuthMiddleware,
    private filterDataParser: FilterDataParser,
    private paginationDataParser: PaginationDataParser,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      this.booksEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { title, releaseYear, language, format, description, price } = request.body;

        const book = await this.createBook({ title, releaseYear, language, format, description, price });

        const controllerResponse: ControllerResponse = { data: { book }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.bookEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const book = await this.findBook({ id: id as string });

        const controllerResponse: ControllerResponse = { data: { book }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.booksEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const filters = this.filterDataParser.parse(
          request.query[QueryParameterName.filter] as string,
          findBooksFilters,
        );

        const pagination = this.paginationDataParser.parse(request.query);

        const books = await this.findBooks({ filters, pagination });

        const controllerResponse: ControllerResponse = { data: { books }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.patch(
      this.bookEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const { description, price } = request.body;

        const book = await this.updateBook({ id: id as string, description, price });

        const controllerResponse: ControllerResponse = { data: { book }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.delete(
      this.bookEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        await this.deleteBook({ id: id as string });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.use(sendResponseMiddleware);

    this.router.use(bookErrorMiddleware);
  }

  private async createBook(input: CreateBookPayload): Promise<Book> {
    const { title, releaseYear, language, format, description, price } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const book = await unitOfWork.runInTransaction(async () => {
      let createBookDraft: CreateBookDraft = {
        title,
        releaseYear,
        language,
        format,
        price,
      };

      if (description) {
        createBookDraft = { ...createBookDraft, description };
      }

      return this.bookService.createBook({
        unitOfWork,
        draft: createBookDraft,
      });
    });

    return book;
  }

  private async findBook(input: FindBookPayload): Promise<Book> {
    const { id } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const book = await unitOfWork.runInTransaction(async () => {
      return this.bookService.findBook({ unitOfWork, bookId: id });
    });

    return book;
  }

  private async findBooks(input: FindBooksPayload): Promise<Book[]> {
    const { filters, pagination } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const books = await unitOfWork.runInTransaction(async () => {
      return this.bookService.findBooks({ unitOfWork, filters, pagination });
    });

    return books;
  }

  private async updateBook(input: UpdateBookPayload): Promise<Book> {
    const { id, description, price } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const book = await unitOfWork.runInTransaction(async () => {
      let updateBookDraft: UpdateBookDraft = {};

      if (description) {
        updateBookDraft = { ...updateBookDraft, description };
      }

      if (price) {
        updateBookDraft = { ...updateBookDraft, price };
      }

      return this.bookService.updateBook({ unitOfWork, bookId: id, draft: updateBookDraft });
    });

    return book;
  }

  private async deleteBook(input: DeleteBookPayload): Promise<void> {
    const { id } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      await this.bookService.deleteBook({ unitOfWork, bookId: id });
    });
  }
}
