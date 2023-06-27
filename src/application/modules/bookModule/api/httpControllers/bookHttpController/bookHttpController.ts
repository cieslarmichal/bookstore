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
  FindBookAuthorsPathParameters,
  FindBookAuthorsQueryParameters,
  FindBookAuthorsResponseOkBody,
  findBookAuthorsPathParametersSchema,
  findBookAuthorsResponseOkBodySchema,
} from './schemas/findBookAuthorsSchema';
import {
  FindBookCategoriesPathParameters,
  FindBookCategoriesQueryParameters,
  FindBookCategoriesResponseOkBody,
  findBookCategoriesPathParametersSchema,
  findBookCategoriesResponseOkBodySchema,
} from './schemas/findBookCategoriesSchema';
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
import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { FindAuthorsByBookIdQueryHandler } from '../../../../authorModule/application/queryHandlers/findAuthorsByBookIdQueryHandler/findAuthorsByBookIdQueryHandler';
import { authorSymbols } from '../../../../authorModule/symbols';
import { FindCategoriesQueryHandler } from '../../../../categoryModule/application/queryHandlers/findCategoriesQueryHandler/findCategoriesQueryHandler';
import { categorySymbols } from '../../../../categoryModule/symbols';
import { CreateBookCommandHandler } from '../../../application/commandHandlers/createBookCommandHandler/createBookCommandHandler';
import { CreateBookDraft } from '../../../application/commandHandlers/createBookCommandHandler/payloads/createBookDraft';
import { DeleteBookCommandHandler } from '../../../application/commandHandlers/deleteBookCommandHandler/deleteBookCommandHandler';
import { UpdateBookCommandHandler } from '../../../application/commandHandlers/updateBookCommandHandler/updateBookCommandHandler';
import { BookNotFoundError } from '../../../application/errors/bookNotFoundError';
import { FindBookQueryHandler } from '../../../application/queryHandlers/findBookQueryHandler/findBookQueryHandler';
import { FindBooksQueryHandler } from '../../../application/queryHandlers/findBooksQueryHandler/findBooksQueryHandler';
import { UpdateBookDraft } from '../../../application/repositories/bookRepository/payloads/updateBookDraft';
import { symbols } from '../../../symbols';

@Injectable()
export class BookHttpController implements HttpController {
  public readonly basePath = 'books';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(symbols.createBookCommandHandler)
    private readonly createBookCommandHandler: CreateBookCommandHandler,
    @Inject(symbols.deleteBookCommandHandler)
    private readonly deleteBookCommandHandler: DeleteBookCommandHandler,
    @Inject(symbols.updateBookCommandHandler)
    private readonly updateBookCommandHandler: UpdateBookCommandHandler,
    @Inject(symbols.findBookQueryHandler)
    private readonly findBookQueryHandler: FindBookQueryHandler,
    @Inject(symbols.findBooksQueryHandler)
    private readonly findBooksQueryHandler: FindBooksQueryHandler,
    @Inject(authorSymbols.findAuthorsByBookIdQueryHandler)
    private readonly findAuthorsByBookIdQueryHandler: FindAuthorsByBookIdQueryHandler,
    @Inject(categorySymbols.findCategoriesQueryHandler)
    private readonly findCategoriesQueryHandler: FindCategoriesQueryHandler,
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
        path: ':id/authors',
        handler: this.findBookAuthors.bind(this),
        schema: {
          request: {
            queryParams: findBookAuthorsPathParametersSchema,
            pathParams: findBookAuthorsPathParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookAuthorsResponseOkBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id/categories',
        handler: this.findBookCategories.bind(this),
        schema: {
          request: {
            queryParams: findBookCategoriesPathParametersSchema,
            pathParams: findBookCategoriesPathParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookCategoriesResponseOkBodySchema,
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

    const { book } = await unitOfWork.runInTransaction(async () => {
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

      return this.createBookCommandHandler.execute({
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

    try {
      const { book } = await unitOfWork.runInTransaction(async () => {
        return this.findBookQueryHandler.execute({ unitOfWork, bookId: id });
      });

      return { statusCode: HttpStatusCode.ok, body: { book: book } };
    } catch (error) {
      if (error instanceof BookNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async findBooks(
    request: HttpRequest<undefined, FindBooksQueryParameters>,
  ): Promise<HttpOkResponse<FindBooksResponseOkBody>> {
    const { filter, limit, page } = request.queryParams;

    const pagination = PaginationDataBuilder.build({ page: Number(page) ?? 0, limit: Number(limit) ?? 0 });

    const filters = filter
      ? FilterDataParser.parse({
          jsonData: filter as string,
          supportedFieldsFilters: findBooksFilters,
        })
      : [];

    const unitOfWork = await this.unitOfWorkFactory.create();

    const { books } = await unitOfWork.runInTransaction(async () => {
      return this.findBooksQueryHandler.execute({ unitOfWork, filters, pagination });
    });

    return { statusCode: HttpStatusCode.ok, body: { data: books } };
  }

  private async findBookAuthors(
    request: HttpRequest<undefined, FindBookAuthorsQueryParameters, FindBookAuthorsPathParameters>,
  ): Promise<HttpOkResponse<FindBookAuthorsResponseOkBody>> {
    const { id } = request.pathParams;

    const { filter, limit, page } = request.queryParams;

    const pagination = PaginationDataBuilder.build({ page: Number(page) ?? 0, limit: Number(limit) ?? 0 });

    const filters = filter
      ? FilterDataParser.parse({
          jsonData: filter as string,
          supportedFieldsFilters: findBooksFilters,
        })
      : [];

    const unitOfWork = await this.unitOfWorkFactory.create();

    const { authors } = await unitOfWork.runInTransaction(async () => {
      return this.findAuthorsByBookIdQueryHandler.execute({ unitOfWork, bookId: id, filters, pagination });
    });

    return { statusCode: HttpStatusCode.ok, body: { data: authors } };
  }

  private async findBookCategories(
    request: HttpRequest<undefined, FindBookCategoriesQueryParameters, FindBookCategoriesPathParameters>,
  ): Promise<HttpOkResponse<FindBookCategoriesResponseOkBody>> {
    const { id } = request.pathParams;

    const { filter, limit, page } = request.queryParams;

    const pagination = PaginationDataBuilder.build({ page: Number(page) ?? 0, limit: Number(limit) ?? 0 });

    const filters = filter
      ? FilterDataParser.parse({
          jsonData: filter as string,
          supportedFieldsFilters: findBooksFilters,
        })
      : [];

    const unitOfWork = await this.unitOfWorkFactory.create();

    const { categories } = await unitOfWork.runInTransaction(async () => {
      return this.findCategoriesQueryHandler.execute({ unitOfWork, bookId: id, filters, pagination });
    });

    return { statusCode: HttpStatusCode.ok, body: { data: categories } };
  }

  private async updateBook(
    request: HttpRequest<UpdateBookBody, undefined, UpdateBookPathParameters>,
  ): Promise<HttpOkResponse<UpdateBookResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const { description, price } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { book } = await unitOfWork.runInTransaction(async () => {
        let updateBookDraft: UpdateBookDraft = {};

        if (description) {
          updateBookDraft = { ...updateBookDraft, description };
        }

        if (price) {
          updateBookDraft = { ...updateBookDraft, price };
        }

        return this.updateBookCommandHandler.execute({ unitOfWork, bookId: id, draft: updateBookDraft });
      });

      return { statusCode: HttpStatusCode.ok, body: { book } };
    } catch (error) {
      if (error instanceof BookNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async deleteBook(
    request: HttpRequest<undefined, undefined, DeleteBookPathParameters>,
  ): Promise<HttpNoContentResponse<DeleteBookResponseNoContentBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      await unitOfWork.runInTransaction(async () => {
        await this.deleteBookCommandHandler.execute({ unitOfWork, bookId: id });
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
