/* eslint-disable @typescript-eslint/naming-convention */
import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { authorBookErrorMiddleware } from './authorBookErrorMiddleware';
import { HttpStatusCode } from '../../../common/http/contracts/httpStatusCode';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Author } from '../../../domain/author/contracts/author';
import { authorBookSymbols } from '../../../domain/authorBook/authorBookSymbols';
import { AuthorBook } from '../../../domain/authorBook/contracts/authorBook';
import { AuthorBookService } from '../../../domain/authorBook/contracts/services/authorBookService/authorBookService';
import { Book } from '../../../domain/book/contracts/book';
import { Injectable, Inject } from '../../../libs/dependencyInjection/contracts/decorators';
import { UnitOfWorkFactory } from '../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkSymbols } from '../../../libs/unitOfWork/unitOfWorkSymbols';
import { findAuthorsFilters } from '../../author/contracts/findAuthorsFilters';
import { findBooksFilters } from '../../book/contracts/findBooksFilters';
import { FilterDataParser } from '../../common/filterDataParser/filterDataParser';
import { AuthMiddleware } from '../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../common/middlewares/sendResponseMiddleware';
import { PaginationDataBuilder } from '../../common/paginationDataBuilder/paginationDataBuilder';
import { ControllerResponse } from '../../controllerResponse';
import { integrationsSymbols } from '../../integrationsSymbols';
import { LocalsName } from '../../localsName';
import { QueryParameterName } from '../../queryParameterName';
import { CreateAuthorBookPayload, createAuthorBookPayloadSchema } from '../contracts/createAuthorBookPayload';
import { DeleteAuthorBookPayload, deleteAuthorBookPayloadSchema } from '../contracts/deleteAuthorBookPayload';
import { FindAuthorsByBookIdPayload, findAuthorsByBookIdPayloadSchema } from '../contracts/findAuthorsByBookIdPayload';
import { FindBooksByAuthorIdPayload, findBooksByAuthorIdPayloadSchema } from '../contracts/findBooksByAuthorIdPayload';

@Injectable()
export class AuthorBookController {
  public readonly router = Router();
  private readonly authorBooksEndpoint = '/authors/:authorId/books';
  private readonly authorBookEndpoint = `${this.authorBooksEndpoint}/:bookId`;
  private readonly bookAuthorsEndpoint = '/books/:bookId/authors';

  public constructor(
    @Inject(unitOfWorkSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(authorBookSymbols.authorBookService)
    private readonly authorBookService: AuthorBookService,
    @Inject(integrationsSymbols.authMiddleware)
    authMiddleware: AuthMiddleware,
    @Inject(integrationsSymbols.filterDataParser)
    private filterDataParser: FilterDataParser,
    @Inject(integrationsSymbols.paginationDataBuilder)
    private paginationDataBuilder: PaginationDataBuilder,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      this.authorBookEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { authorId, bookId } = request.params;

        const authorBook = await this.createAuthorBook({ authorId: authorId as string, bookId: bookId as string });

        const controllerResponse: ControllerResponse = { data: { authorBook }, statusCode: HttpStatusCode.created };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.authorBooksEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { authorId } = request.params;

        const filters = this.filterDataParser.parse({
          jsonData: request.query[QueryParameterName.filter] as string,
          supportedFieldsFilters: findBooksFilters,
        });

        const page = Number(request.query[QueryParameterName.page] ?? 0);

        const limit = Number(request.query[QueryParameterName.limit] ?? 0);

        const pagination = this.paginationDataBuilder.build({ page, limit });

        const books = await this.findBooksByAuthorId({ authorId: authorId as string, filters, pagination });

        const controllerResponse: ControllerResponse = { data: { books }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.bookAuthorsEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { bookId } = request.params;

        const filters = this.filterDataParser.parse({
          jsonData: request.query[QueryParameterName.filter] as string,
          supportedFieldsFilters: findAuthorsFilters,
        });

        const page = Number(request.query[QueryParameterName.page] ?? 0);

        const limit = Number(request.query[QueryParameterName.limit] ?? 0);

        const pagination = this.paginationDataBuilder.build({ page, limit });

        const authors = await this.findAuthorsByBookId({ bookId: bookId as string, filters, pagination });

        const controllerResponse: ControllerResponse = { data: { authors }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.delete(
      this.authorBookEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { authorId, bookId } = request.params;

        await this.deleteAuthorBook({ authorId: authorId as string, bookId: bookId as string });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.use(sendResponseMiddleware);

    this.router.use(authorBookErrorMiddleware);
  }

  private async createAuthorBook(input: CreateAuthorBookPayload): Promise<AuthorBook> {
    const { authorId, bookId } = PayloadFactory.create(createAuthorBookPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const authorBook = await unitOfWork.runInTransaction(async () => {
      return this.authorBookService.createAuthorBook({
        unitOfWork,
        draft: {
          authorId,
          bookId,
        },
      });
    });

    return authorBook;
  }

  private async findBooksByAuthorId(input: FindBooksByAuthorIdPayload): Promise<Book[]> {
    const { authorId, filters, pagination } = PayloadFactory.create(findBooksByAuthorIdPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const books = await unitOfWork.runInTransaction(async () => {
      return this.authorBookService.findBooksByAuthorId({
        unitOfWork,
        authorId,
        filters,
        pagination,
      });
    });

    return books;
  }

  private async findAuthorsByBookId(input: FindAuthorsByBookIdPayload): Promise<Author[]> {
    const { bookId, filters, pagination } = PayloadFactory.create(findAuthorsByBookIdPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const authors = await unitOfWork.runInTransaction(async () => {
      return this.authorBookService.findAuthorsByBookId({ unitOfWork, bookId, filters, pagination });
    });

    return authors;
  }

  private async deleteAuthorBook(input: DeleteAuthorBookPayload): Promise<void> {
    const { authorId, bookId } = PayloadFactory.create(deleteAuthorBookPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      await this.authorBookService.deleteAuthorBook({
        unitOfWork,
        authorId,
        bookId,
      });
    });
  }
}
