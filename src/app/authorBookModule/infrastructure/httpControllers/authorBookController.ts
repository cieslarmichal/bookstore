import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { authorBookErrorMiddleware } from './authorBookErrorMiddleware';
import { CreateAuthorBookPayload, createAuthorBookPayloadSchema } from './payloads/createAuthorBookPayload';
import { DeleteAuthorBookPayload, deleteAuthorBookPayloadSchema } from './payloads/deleteAuthorBookPayload';
import { FindAuthorsByBookIdPayload, findAuthorsByBookIdPayloadSchema } from './payloads/findAuthorsByBookIdPayload';
import { FindBooksByAuthorIdPayload, findBooksByAuthorIdPayloadSchema } from './payloads/findBooksByAuthorIdPayload';
import { HttpStatusCode } from '../../../../common/http/contracts/httpStatusCode';
import { Injectable, Inject } from '../../../../libs/dependencyInjection/contracts/decorators';
import { UnitOfWorkFactory } from '../../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkSymbols } from '../../../../libs/unitOfWork/unitOfWorkSymbols';
import { Validator } from '../../../../libs/validator/implementations/validator';
import { Author } from '../../../authorModule/domain/entities/author/author';
import { Book } from '../../../bookModule/domain/entities/book/book';
import { findAuthorsFilters } from '../../../integrations/author/contracts/findAuthorsFilters';
import { findBooksFilters } from '../../../integrations/book/contracts/findBooksFilters';
import { FilterDataParser } from '../../../integrations/common/filterDataParser/filterDataParser';
import { AuthMiddleware } from '../../../integrations/common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../integrations/common/middlewares/sendResponseMiddleware';
import { PaginationDataBuilder } from '../../../integrations/common/paginationDataBuilder/paginationDataBuilder';
import { ControllerResponse } from '../../../integrations/controllerResponse';
import { LocalsName } from '../../../integrations/localsName';
import { QueryParameterName } from '../../../integrations/queryParameterName';
import { AuthorBookService } from '../../application/services/authorBookService/authorBookService';
import { AuthorBook } from '../../domain/entities/authorBook/authorBook';

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
          ? this.filterDataParser.parse({
              jsonData: filtersInput,
              supportedFieldsFilters: findAuthorsFilters,
            })
          : [];

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
