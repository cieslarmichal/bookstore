/* eslint-disable @typescript-eslint/naming-convention */
import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatusCode } from '../../../../../common/http/contracts/httpStatusCode';
import { Author } from '../../../../../domain/author/contracts/author';
import { AuthorBook } from '../../../../../domain/authorBook/contracts/authorBook';
import { AuthorBookService } from '../../../../../domain/authorBook/contracts/services/authorBookService/authorBookService';
import { Book } from '../../../../../domain/book/contracts/book';
import { UnitOfWorkFactory } from '../../../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { findAuthorsFilters } from '../../../../author/contracts/controllers/authorController/findAuthorsFilters';
import { findBooksFilters } from '../../../../book/contracts/controllers/bookController/findBooksFilters';
import { FilterDataParser } from '../../../../common/filterDataParser/filterDataParser';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { PaginationDataParser } from '../../../../common/paginationDataParser/paginationDataParser';
import { ControllerResponse } from '../../../../controllerResponse';
import { LocalsName } from '../../../../localsName';
import { QueryParameterName } from '../../../../queryParameterName';
import { CreateAuthorBookPayload } from '../../../contracts/controllers/authorBookController/createAuthorBookPayload';
import { DeleteAuthorBookPayload } from '../../../contracts/controllers/authorBookController/deleteAuthorBookPayload';
import { FindAuthorsByBookIdPayload } from '../../../contracts/controllers/authorBookController/findAuthorsByBookIdPayload';
import { FindBooksByAuthorIdPayload } from '../../../contracts/controllers/authorBookController/findBooksByAuthorIdPayload';
import { authorBookErrorMiddleware } from '../../middlewares/authorBookErrorMiddleware/authorBookErrorMiddleware';

export class AuthorBookController {
  public readonly router = Router();
  private readonly authorBooksEndpoint = '/authors/:authorId/books';
  private readonly authorBookEndpoint = `${this.authorBooksEndpoint}/:bookId`;
  private readonly bookAuthorsEndpoint = '/books/:bookId/authors';

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly authorBookService: AuthorBookService,
    authMiddleware: AuthMiddleware,
    private filterDataParser: FilterDataParser,
    private paginationDataParser: PaginationDataParser,
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

        const pagination = this.paginationDataParser.parse(request.query);

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

        const pagination = this.paginationDataParser.parse(request.query);

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
    const { authorId, bookId } = input;

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
    const { authorId, filters, pagination } = input;

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
    const { bookId, filters, pagination } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const authors = await unitOfWork.runInTransaction(async () => {
      return this.authorBookService.findAuthorsByBookId({ unitOfWork, bookId, filters, pagination });
    });

    return authors;
  }

  private async deleteAuthorBook(input: DeleteAuthorBookPayload): Promise<void> {
    const { authorId, bookId } = input;

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
