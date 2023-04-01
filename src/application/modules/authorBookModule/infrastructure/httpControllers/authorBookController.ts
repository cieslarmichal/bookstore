import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { authorBookErrorMiddleware } from './authorBookErrorMiddleware';
import { CreateAuthorBookPayload, createAuthorBookPayloadSchema } from './payloads/createAuthorBookPayload';
import { DeleteAuthorBookPayload, deleteAuthorBookPayloadSchema } from './payloads/deleteAuthorBookPayload';
import { FindAuthorsByBookIdPayload, findAuthorsByBookIdPayloadSchema } from './payloads/findAuthorsByBookIdPayload';
import { FindBooksByAuthorIdPayload, findBooksByAuthorIdPayloadSchema } from './payloads/findBooksByAuthorIdPayload';
import { FilterDataParser } from '../../../../common/filterDataParser/filterDataParser';
import { HttpStatusCode } from '../../../../common/http/httpStatusCode';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { PaginationDataBuilder } from '../../../../common/paginationDataBuilder/paginationDataBuilder';
import { ControllerResponse } from '../../../../common/types/controllerResponse';
import { LocalsName } from '../../../../common/types/localsName';
import { QueryParameterName } from '../../../../common/types/queryParameterName';
import { Injectable, Inject } from '../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { Validator } from '../../../../libs/validator/validator';
import { Author } from '../../../authorModule/domain/entities/author/author';
import { findAuthorsFilters } from '../../../authorModule/infrastructure/httpControllers/payloads/findAuthorsFilters';
import { Book } from '../../../bookModule/domain/entities/book/book';
import { findBooksFilters } from '../../../bookModule/infrastructure/httpControllers/payloads/findBooksFilters';
import { AuthorBookService } from '../../application/services/authorBookService/authorBookService';
import { authorBookModuleSymbols } from '../../authorBookModuleSymbols';
import { AuthorBook } from '../../domain/entities/authorBook/authorBook';

@Injectable()
export class AuthorBookController {
  public readonly router = Router();
  private readonly authorBooksEndpoint = '/authors/:authorId/books';
  private readonly authorBookEndpoint = `${this.authorBooksEndpoint}/:bookId`;
  private readonly bookAuthorsEndpoint = '/books/:bookId/authors';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(authorBookModuleSymbols.authorBookService)
    private readonly authorBookService: AuthorBookService,
    @Inject(integrationsSymbols.authMiddleware)
    authMiddleware: AuthMiddleware,
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

        const filtersInput = request.query[QueryParameterName.filter] as string;

        const filters = filtersInput
          ? FilterDataParser.parse({
              jsonData: filtersInput,
              supportedFieldsFilters: findBooksFilters,
            })
          : [];

        const page = Number(request.query[QueryParameterName.page] ?? 0);

        const limit = Number(request.query[QueryParameterName.limit] ?? 0);

        const pagination = PaginationDataBuilder.build({ page, limit });

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

        const filtersInput = request.query[QueryParameterName.filter] as string;

        const filters = filtersInput
          ? FilterDataParser.parse({
              jsonData: filtersInput,
              supportedFieldsFilters: findAuthorsFilters,
            })
          : [];

        const page = Number(request.query[QueryParameterName.page] ?? 0);

        const limit = Number(request.query[QueryParameterName.limit] ?? 0);

        const pagination = PaginationDataBuilder.build({ page, limit });

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
    const { authorId, bookId } = Validator.validate(createAuthorBookPayloadSchema, input);

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
    const { authorId, filters, pagination } = Validator.validate(findBooksByAuthorIdPayloadSchema, input);

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
    const { bookId, filters, pagination } = Validator.validate(findAuthorsByBookIdPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const authors = await unitOfWork.runInTransaction(async () => {
      return this.authorBookService.findAuthorsByBookId({ unitOfWork, bookId, filters, pagination });
    });

    return authors;
  }

  private async deleteAuthorBook(input: DeleteAuthorBookPayload): Promise<void> {
    const { authorId, bookId } = Validator.validate(deleteAuthorBookPayloadSchema, input);

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
