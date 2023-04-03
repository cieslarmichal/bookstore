import {
  createBookBodySchema,
  createBookResponseCreatedBodySchema,
  CreateBookBody,
  CreateBookResponseCreatedBody,
} from './schemas/createBookSchema';
import {
  deleteBookPathParametersSchema,
  deleteBookResponseNoContentBodySchema,
  DeleteBookPathParameters,
  DeleteBookResponseNoContentBody,
} from './schemas/deleteBookSchema';
import {
  FindBookPathParameters,
  FindBookResponseOkBody,
  findBookPathParametersSchema,
  findBookResponseOkBodySchema,
} from './schemas/findBookSchema';
import { findBooksFilters } from './schemas/findBooksFilters';
import {
  FindBooksQueryParameters,
  FindBooksResponseOkBody,
  findBooksQueryParametersSchema,
  findBooksResponseOkBodySchema,
} from './schemas/findBooksSchema';
import {
  updateBookPathParametersSchema,
  updateBookBodySchema,
  updateBookResponseOkBodySchema,
  UpdateBookBody,
  UpdateBookPathParameters,
  UpdateBookResponseOkBody,
} from './schemas/updateBookSchema';
import { FilterDataParser } from '../../../../../../common/filterDataParser/filterDataParser';
import { AuthorizationType } from '../../../../../../common/http/authorizationType';
import { HttpController } from '../../../../../../common/http/httpController';
import { HttpMethodName } from '../../../../../../common/http/httpMethodName';
import { HttpRequest } from '../../../../../../common/http/httpRequest';
import {
  HttpCreatedResponse,
  HttpNoContentResponse,
  HttpNotFoundResponse,
  HttpOkResponse,
} from '../../../../../../common/http/httpResponse';
import { HttpRoute } from '../../../../../../common/http/httpRoute';
import { HttpStatusCode } from '../../../../../../common/http/httpStatusCode';
import { ResponseErrorBody, responseErrorBodySchema } from '../../../../../../common/http/responseErrorBodySchema';
import { PaginationDataBuilder } from '../../../../../../common/paginationDataBuilder/paginationDataBuilder';
import { Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { BookService } from '../../../application/services/bookService/bookService';
import { CreateBookDraft } from '../../../application/services/bookService/payloads/createBookDraft';
import { UpdateBookDraft } from '../../../application/services/bookService/payloads/updateBookDraft';
import { bookModuleSymbols } from '../../../bookModuleSymbols';
import { Book } from '../../../domain/entities/book/book';
import { BookNotFoundError } from '../../errors/bookNotFoundError';

export class BookHttpController implements HttpController {
  public readonly basePath = 'books';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(bookModuleSymbols.bookService)
    private readonly bookService: BookService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createBook.bind(this),
        schema: {
          request: {
            body: createBookBodySchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createBookResponseCreatedBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.findBooks.bind(this),
        schema: {
          request: {
            queryParams: findBooksQueryParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBooksResponseOkBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findBook.bind(this),
        schema: {
          request: {
            pathParams: findBookPathParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookResponseOkBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: ':id',
        handler: this.updateBook.bind(this),
        schema: {
          request: {
            pathParams: updateBookPathParametersSchema,
            body: updateBookBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: updateBookResponseOkBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':id',
        handler: this.deleteBook.bind(this),
        schema: {
          request: {
            pathParams: deleteBookPathParametersSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteBookResponseNoContentBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
    ];
  }

  private async createBook(
    request: HttpRequest<CreateBookBody>,
  ): Promise<HttpCreatedResponse<CreateBookResponseCreatedBody>> {
    const { title, isbn, releaseYear, language, format, description, price } = request.body;

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

    return { statusCode: HttpStatusCode.created, body: { book } };
  }

  private async findBook(
    request: HttpRequest<undefined, undefined, FindBookPathParameters>,
  ): Promise<HttpOkResponse<FindBookResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let book: Book | undefined;

    try {
      book = await unitOfWork.runInTransaction(async () => {
        return this.bookService.findBook({ unitOfWork, bookId: id as string });
      });
    } catch (error) {
      if (error instanceof BookNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.ok, body: { book: book as Book } };
  }

  private async findBooks(
    request: HttpRequest<undefined, FindBooksQueryParameters>,
  ): Promise<HttpOkResponse<FindBooksResponseOkBody>> {
    const { filter, limit, page } = request.queryParams;

    const pagination = PaginationDataBuilder.build({ page: page ?? 0, limit: limit ?? 0 });

    const filters = filter
      ? FilterDataParser.parse({
          jsonData: filter as string,
          supportedFieldsFilters: findBooksFilters,
        })
      : [];

    const unitOfWork = await this.unitOfWorkFactory.create();

    const books = await unitOfWork.runInTransaction(async () => {
      return this.bookService.findBooks({ unitOfWork, filters, pagination });
    });

    return { statusCode: HttpStatusCode.ok, body: { data: books } };
  }

  private async updateBook(
    request: HttpRequest<UpdateBookBody, undefined, UpdateBookPathParameters>,
  ): Promise<HttpOkResponse<UpdateBookResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const { description, price } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let book: Book | undefined;

    try {
      book = await unitOfWork.runInTransaction(async () => {
        let updateBookDraft: UpdateBookDraft = {};

        if (description) {
          updateBookDraft = { ...updateBookDraft, description };
        }

        if (price) {
          updateBookDraft = { ...updateBookDraft, price };
        }

        return this.bookService.updateBook({ unitOfWork, bookId: id, draft: updateBookDraft });
      });
    } catch (error) {
      if (error instanceof BookNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.ok, body: { book: book as Book } };
  }

  private async deleteBook(
    request: HttpRequest<undefined, undefined, DeleteBookPathParameters>,
  ): Promise<HttpNoContentResponse<DeleteBookResponseNoContentBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      await unitOfWork.runInTransaction(async () => {
        await this.bookService.deleteBook({ unitOfWork, bookId: id as string });
      });
    } catch (error) {
      if (error instanceof BookNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.noContent, body: null };
  }
}
