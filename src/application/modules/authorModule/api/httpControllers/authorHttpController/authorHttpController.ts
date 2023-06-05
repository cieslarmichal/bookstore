import {
  createAuthorBodySchema,
  createAuthorResponseCreatedBodySchema,
  CreateAuthorBody,
  CreateAuthorResponseCreatedBody,
} from './schemas/createAuthorSchema';
import {
  deleteAuthorPathParametersSchema,
  deleteAuthorResponseNoContentBodySchema,
  DeleteAuthorPathParameters,
  DeleteAuthorResponseNoContentBody,
} from './schemas/deleteAuthorSchema';
import {
  FindAuthorBooksPathParameters,
  FindAuthorBooksResponseOkBody,
  findAuthorBooksPathParametersSchema,
  findAuthorBooksQueryParametersSchema,
  findAuthorBooksResponseOkBodySchema,
} from './schemas/findAuthorBooksSchema';
import {
  FindAuthorPathParameters,
  FindAuthorResponseOkBody,
  findAuthorPathParametersSchema,
  findAuthorResponseOkBodySchema,
} from './schemas/findAuthorSchema';
import { findAuthorsFilters } from './schemas/findAuthorsFilters';
import {
  FindAuthorsQueryParameters,
  FindAuthorsResponseOkBody,
  findAuthorsQueryParametersSchema,
  findAuthorsResponseOkBodySchema,
} from './schemas/findAuthorsSchema';
import {
  updateAuthorPathParametersSchema,
  updateAuthorBodySchema,
  updateAuthorResponseOkBodySchema,
  UpdateAuthorBody,
  UpdateAuthorPathParameters,
  UpdateAuthorResponseOkBody,
} from './schemas/updateAuthorSchema';
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
import { FindBooksQueryHandler } from '../../../../bookModule/application/queryHandlers/findBooksQueryHandler/findBooksQueryHandler';
import { bookSymbols } from '../../../../bookModule/symbols';
import { CreateAuthorCommandHandler } from '../../../application/commandHandlers/createAuthorCommandHandler/createAuthorCommandHandler';
import { CreateAuthorDraft } from '../../../application/commandHandlers/createAuthorCommandHandler/payloads/createAuthorDraft';
import { DeleteAuthorCommandHandler } from '../../../application/commandHandlers/deleteAuthorCommandHandler/deleteAuthorCommandHandler';
import { UpdateAuthorCommandHandler } from '../../../application/commandHandlers/updateAuthorCommandHandler/updateAuthorCommandHandler';
import { AuthorNotFoundError } from '../../../application/errors/authorNotFoundError';
import { FindAuthorQueryHandler } from '../../../application/queryHandlers/findAuthorQueryHandler/findAuthorQueryHandler';
import { FindAuthorsQueryHandler } from '../../../application/queryHandlers/findAuthorsQueryHandler/findAuthorsQueryHandler';
import { symbols } from '../../../symbols';

export class AuthorHttpController implements HttpController {
  public readonly basePath = 'authors';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(symbols.createAuthorCommandHandler)
    private readonly createAuthorCommandHandler: CreateAuthorCommandHandler,
    @Inject(symbols.deleteAuthorCommandHandler)
    private readonly deleteAuthorCommandHandler: DeleteAuthorCommandHandler,
    @Inject(symbols.updateAuthorCommandHandler)
    private readonly updateAuthorCommandHandler: UpdateAuthorCommandHandler,
    @Inject(symbols.findAuthorQueryHandler)
    private readonly findAuthorQueryHandler: FindAuthorQueryHandler,
    @Inject(symbols.findAuthorsQueryHandler)
    private readonly findAuthorsQueryHandler: FindAuthorsQueryHandler,
    @Inject(bookSymbols.findBooksQueryHandler)
    private readonly findBooksQueryHandler: FindBooksQueryHandler,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createAuthor.bind(this),
        schema: {
          request: {
            body: createAuthorBodySchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createAuthorResponseCreatedBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.findAuthors.bind(this),
        schema: {
          request: {
            queryParams: findAuthorsQueryParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findAuthorsResponseOkBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id/books',
        handler: this.findAuthorBooks.bind(this),
        schema: {
          request: {
            queryParams: findAuthorBooksQueryParametersSchema,
            pathParams: findAuthorBooksPathParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findAuthorBooksResponseOkBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findAuthor.bind(this),
        schema: {
          request: {
            pathParams: findAuthorPathParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findAuthorResponseOkBodySchema,
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
        handler: this.updateAuthor.bind(this),
        schema: {
          request: {
            pathParams: updateAuthorPathParametersSchema,
            body: updateAuthorBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: updateAuthorResponseOkBodySchema,
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
        handler: this.deleteAuthor.bind(this),
        schema: {
          request: {
            pathParams: deleteAuthorPathParametersSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteAuthorResponseNoContentBodySchema,
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

  private async createAuthor(
    request: HttpRequest<CreateAuthorBody>,
  ): Promise<HttpCreatedResponse<CreateAuthorResponseCreatedBody>> {
    const { firstName, lastName, about } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const { author } = await unitOfWork.runInTransaction(async () => {
      let createAuthorDraft: CreateAuthorDraft = {
        firstName,
        lastName,
      };

      if (about) {
        createAuthorDraft = { ...createAuthorDraft, about };
      }

      return this.createAuthorCommandHandler.execute({ unitOfWork, draft: createAuthorDraft });
    });

    return { statusCode: HttpStatusCode.created, body: { author } };
  }

  private async findAuthor(
    request: HttpRequest<undefined, undefined, FindAuthorPathParameters>,
  ): Promise<HttpOkResponse<FindAuthorResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { author } = await unitOfWork.runInTransaction(async () => {
        return this.findAuthorQueryHandler.execute({ unitOfWork, authorId: id });
      });

      return { statusCode: HttpStatusCode.ok, body: { author: author } };
    } catch (error) {
      if (error instanceof AuthorNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async findAuthors(
    request: HttpRequest<undefined, FindAuthorsQueryParameters>,
  ): Promise<HttpOkResponse<FindAuthorsResponseOkBody>> {
    const { filter, limit, page } = request.queryParams;

    const pagination = PaginationDataBuilder.build({ page: Number(page) ?? 0, limit: Number(limit) ?? 0 });

    const filters = filter
      ? FilterDataParser.parse({
          jsonData: filter as string,
          supportedFieldsFilters: findAuthorsFilters,
        })
      : [];

    const unitOfWork = await this.unitOfWorkFactory.create();

    const { authors } = await unitOfWork.runInTransaction(async () => {
      return this.findAuthorsQueryHandler.execute({ unitOfWork, filters, pagination });
    });

    return { statusCode: HttpStatusCode.ok, body: { data: authors } };
  }

  private async findAuthorBooks(
    request: HttpRequest<undefined, FindAuthorsQueryParameters, FindAuthorBooksPathParameters>,
  ): Promise<HttpOkResponse<FindAuthorBooksResponseOkBody>> {
    const { id } = request.pathParams;

    const { filter, limit, page } = request.queryParams;

    const pagination = PaginationDataBuilder.build({ page: Number(page) ?? 0, limit: Number(limit) ?? 0 });

    const filters = filter
      ? FilterDataParser.parse({
          jsonData: filter as string,
          supportedFieldsFilters: findAuthorsFilters,
        })
      : [];

    const unitOfWork = await this.unitOfWorkFactory.create();

    const { books } = await unitOfWork.runInTransaction(async () => {
      return this.findBooksQueryHandler.execute({ unitOfWork, filters, pagination, authorId: id });
    });

    return { statusCode: HttpStatusCode.ok, body: { data: books } };
  }

  private async updateAuthor(
    request: HttpRequest<UpdateAuthorBody, undefined, UpdateAuthorPathParameters>,
  ): Promise<HttpOkResponse<UpdateAuthorResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const { about } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { author } = await unitOfWork.runInTransaction(async () => {
        return this.updateAuthorCommandHandler.execute({ unitOfWork, authorId: id as string, draft: { about } });
      });

      return { statusCode: HttpStatusCode.ok, body: { author } };
    } catch (error) {
      if (error instanceof AuthorNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async deleteAuthor(
    request: HttpRequest<undefined, undefined, DeleteAuthorPathParameters>,
  ): Promise<HttpNoContentResponse<DeleteAuthorResponseNoContentBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      await unitOfWork.runInTransaction(async () => {
        await this.deleteAuthorCommandHandler.execute({ unitOfWork, authorId: id });
      });
    } catch (error) {
      if (error instanceof AuthorNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.noContent, body: null };
  }
}
