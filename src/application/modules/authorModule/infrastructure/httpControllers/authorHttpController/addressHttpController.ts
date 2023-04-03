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
import { CustomerIdNotProvidedError } from '../../../../addressModule/infrastructure/errors/customerIdNotProvidedError';
import { AuthorService } from '../../../application/services/authorService/authorService';
import { CreateAuthorDraft } from '../../../application/services/authorService/payloads/createAuthorDraft';
import { authorModuleSymbols } from '../../../authorModuleSymbols';
import { Author } from '../../../domain/entities/author/author';
import { AuthorNotFoundError } from '../../errors/authorNotFoundError';

export class AuthorHttpController implements HttpController {
  public readonly basePath = 'authors';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(authorModuleSymbols.authorService)
    private readonly authorService: AuthorService,
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

    const author = await unitOfWork.runInTransaction(async () => {
      let createAuthorDraft: CreateAuthorDraft = {
        firstName,
        lastName,
      };

      if (about) {
        createAuthorDraft = { ...createAuthorDraft, about };
      }

      return this.authorService.createAuthor({ unitOfWork, draft: createAuthorDraft });
    });

    return { statusCode: HttpStatusCode.created, body: { author } };
  }

  private async findAuthor(
    request: HttpRequest<undefined, undefined, FindAuthorPathParameters>,
  ): Promise<HttpOkResponse<FindAuthorResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let author: Author | undefined;

    try {
      author = await unitOfWork.runInTransaction(async () => {
        return this.authorService.findAuthor({ unitOfWork, authorId: id as string });
      });
    } catch (error) {
      if (error instanceof AuthorNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.ok, body: { author: author as Author } };
  }

  private async findAuthors(
    request: HttpRequest<undefined, FindAuthorsQueryParameters>,
  ): Promise<HttpOkResponse<FindAuthorsResponseOkBody>> {
    const { filter, limit, page } = request.queryParams;

    const pagination = PaginationDataBuilder.build({ page: page ?? 0, limit: limit ?? 0 });

    const filters = filter
      ? FilterDataParser.parse({
          jsonData: filter as string,
          supportedFieldsFilters: findAuthorsFilters,
        })
      : [];

    if (!filters.length) {
      throw new CustomerIdNotProvidedError();
    }

    const unitOfWork = await this.unitOfWorkFactory.create();

    const authors = await unitOfWork.runInTransaction(async () => {
      return this.authorService.findAuthors({ unitOfWork, filters, pagination });
    });

    return { statusCode: HttpStatusCode.ok, body: { data: authors } };
  }

  private async updateAuthor(
    request: HttpRequest<UpdateAuthorBody, undefined, UpdateAuthorPathParameters>,
  ): Promise<HttpOkResponse<UpdateAuthorResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const { about } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let author: Author | undefined;

    try {
      author = await unitOfWork.runInTransaction(async () => {
        return this.authorService.updateAuthor({ unitOfWork, authorId: id as string, draft: { about } });
      });
    } catch (error) {
      if (error instanceof AuthorNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.ok, body: { author: author as Author } };
  }

  private async deleteAuthor(
    request: HttpRequest<undefined, undefined, DeleteAuthorPathParameters>,
  ): Promise<HttpNoContentResponse<DeleteAuthorResponseNoContentBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      await unitOfWork.runInTransaction(async () => {
        await this.authorService.deleteAuthor({ unitOfWork, authorId: id as string });
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
