import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { bookErrorMiddleware } from './bookErrorMiddleware';
import { CreateBookPayload, createBookPayloadSchema } from './payloads/createBookPayload';
import { DeleteBookPayload, deleteBookPayloadSchema } from './payloads/deleteBookPayload';
import { FindBookPayload, findBookPayloadSchema } from './payloads/findBookPayload';
import { findBooksFilters } from './payloads/findBooksFilters';
import { FindBooksPayload, findBooksPayloadSchema } from './payloads/findBooksPayload';
import { UpdateBookPayload, updateBookPayloadSchema } from './payloads/updateBookPayload';
import { FilterDataParser } from '../../../../common/filterDataParser/filterDataParser';
import { HttpStatusCode } from '../../../../common/http/contracts/httpStatusCode';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { PaginationDataBuilder } from '../../../../common/paginationDataBuilder/paginationDataBuilder';
import { ControllerResponse } from '../../../../common/types/contracts/controllerResponse';
import { LocalsName } from '../../../../common/types/contracts/localsName';
import { QueryParameterName } from '../../../../common/types/contracts/queryParameterName';
import { Injectable, Inject } from '../../../../libs/dependencyInjection/contracts/decorators';
import { UnitOfWorkFactory } from '../../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkSymbols } from '../../../../libs/unitOfWork/unitOfWorkSymbols';
import { Validator } from '../../../../libs/validator/implementations/validator';
import { BookService } from '../../application/services/bookService/bookService';
import { CreateBookDraft } from '../../application/services/bookService/payloads/createBookDraft';
import { UpdateBookDraft } from '../../application/services/bookService/payloads/updateBookDraft';
import { bookModuleSymbols } from '../../bookModuleSymbols';
import { Book } from '../../domain/entities/book/book';

@Injectable()
export class BookController {
  public readonly router = Router();
  private readonly booksEndpoint = '/books';
  private readonly bookEndpoint = `${this.booksEndpoint}/:id`;

  public constructor(
    @Inject(unitOfWorkSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(bookModuleSymbols.bookService)
    private readonly bookService: BookService,
    @Inject(integrationsSymbols.authMiddleware)
    authMiddleware: AuthMiddleware,
    @Inject(integrationsSymbols.filterDataParser)
    private filterDataParser: FilterDataParser,
    @Inject(integrationsSymbols.paginationDataBuilder)
    private paginationDataBuilder: PaginationDataBuilder,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      this.booksEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { title, isbn, releaseYear, language, format, description, price } = request.body;

        const book = await this.createBook({ title, isbn, releaseYear, language, format, description, price });

        const controllerResponse: ControllerResponse = { data: { book }, statusCode: HttpStatusCode.created };

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
        const filtersInput = request.query[QueryParameterName.filter] as string;

        const filters = filtersInput
          ? this.filterDataParser.parse({
              jsonData: filtersInput,
              supportedFieldsFilters: findBooksFilters,
            })
          : [];

        const page = Number(request.query[QueryParameterName.page] ?? 0);

        const limit = Number(request.query[QueryParameterName.limit] ?? 0);

        const pagination = this.paginationDataBuilder.build({ page, limit });

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
    const { title, isbn, releaseYear, language, format, description, price } = Validator.validate(
      createBookPayloadSchema,
      input,
    );

    const unitOfWork = await this.unitOfWorkFactory.create();

    const book = await unitOfWork.runInTransaction(async () => {
      let createBookDraft: CreateBookDraft = {
        title,
        isbn,
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
    const { id } = Validator.validate(findBookPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const book = await unitOfWork.runInTransaction(async () => {
      return this.bookService.findBook({ unitOfWork, bookId: id });
    });

    return book;
  }

  private async findBooks(input: FindBooksPayload): Promise<Book[]> {
    const { filters, pagination } = Validator.validate(findBooksPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const books = await unitOfWork.runInTransaction(async () => {
      return this.bookService.findBooks({ unitOfWork, filters, pagination });
    });

    return books;
  }

  private async updateBook(input: UpdateBookPayload): Promise<Book> {
    const { id, description, price } = Validator.validate(updateBookPayloadSchema, input);

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
    const { id } = Validator.validate(deleteBookPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      await this.bookService.deleteBook({ unitOfWork, bookId: id });
    });
  }
}
