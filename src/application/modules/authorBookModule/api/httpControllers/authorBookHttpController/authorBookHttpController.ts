import {
  createAuthorBookPathParametersSchema,
  createAuthorBookResponseCreatedBodySchema,
  CreateAuthorBookPathParameters,
  CreateAuthorBookResponseCreatedBody,
} from './schemas/createAuthorBookSchema';
import {
  deleteAuthorBookPathParametersSchema,
  deleteAuthorBookResponseNoContentBodySchema,
  DeleteAuthorBookPathParameters,
  DeleteAuthorBookResponseNoContentBody,
} from './schemas/deleteAuthorBookSchema';
import { AuthorizationType } from '../../../../../../common/http/authorizationType';
import { HttpController } from '../../../../../../common/http/httpController';
import { HttpMethodName } from '../../../../../../common/http/httpMethodName';
import { HttpRequest } from '../../../../../../common/http/httpRequest';
import {
  HttpCreatedResponse,
  HttpNoContentResponse,
  HttpNotFoundResponse,
  HttpUnprocessableEntityResponse,
} from '../../../../../../common/http/httpResponse';
import { HttpRoute } from '../../../../../../common/http/httpRoute';
import { HttpStatusCode } from '../../../../../../common/http/httpStatusCode';
import { ResponseErrorBody, responseErrorBodySchema } from '../../../../../../common/http/responseErrorBodySchema';
import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { AuthorNotFoundError } from '../../../../authorModule/application/errors/authorNotFoundError';
import { BookNotFoundError } from '../../../../bookModule/application/errors/bookNotFoundError';
import { CreateAuthorBookCommandHandler } from '../../../application/commandHandlers/createAuthorBookCommandHandler/createAuthorBookCommandHandler';
import { DeleteAuthorBookCommandHandler } from '../../../application/commandHandlers/deleteAuthorBookCommandHandler/deleteAuthorBookCommandHandler';
import { AuthorBookAlreadyExistsError } from '../../../application/errors/authorBookAlreadyExistsError';
import { AuthorBookNotFoundError } from '../../../application/errors/authorBookNotFoundError';
import { symbols } from '../../../symbols';

@Injectable()
export class AuthorBookHttpController implements HttpController {
  public readonly basePath = '/authors/:authorId/books/:bookId';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(symbols.createAuthorBookCommandHandler)
    private readonly createAuthorBookCommandHandler: CreateAuthorBookCommandHandler,
    @Inject(symbols.deleteAuthorBookCommandHandler)
    private readonly deleteAuthorBookCommandHandler: DeleteAuthorBookCommandHandler,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createAuthorBook.bind(this),
        schema: {
          request: {
            pathParams: createAuthorBookPathParametersSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createAuthorBookResponseCreatedBodySchema,
            },
            [HttpStatusCode.unprocessableEntity]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        handler: this.deleteAuthorBook.bind(this),
        schema: {
          request: {
            pathParams: deleteAuthorBookPathParametersSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteAuthorBookResponseNoContentBodySchema,
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

  private async createAuthorBook(
    request: HttpRequest<undefined, undefined, CreateAuthorBookPathParameters>,
  ): Promise<
    | HttpCreatedResponse<CreateAuthorBookResponseCreatedBody>
    | HttpUnprocessableEntityResponse<ResponseErrorBody>
    | HttpNotFoundResponse<ResponseErrorBody>
  > {
    const { authorId, bookId } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { authorBook } = await unitOfWork.runInTransaction(async () => {
        return this.createAuthorBookCommandHandler.execute({
          unitOfWork,
          draft: {
            authorId,
            bookId,
          },
        });
      });
      return { statusCode: HttpStatusCode.created, body: { authorBook } };
    } catch (error) {
      if (error instanceof AuthorBookAlreadyExistsError) {
        return { statusCode: HttpStatusCode.unprocessableEntity, body: { error } };
      }

      if (error instanceof AuthorNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      if (error instanceof BookNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async deleteAuthorBook(
    request: HttpRequest<undefined, undefined, DeleteAuthorBookPathParameters>,
  ): Promise<HttpNoContentResponse<DeleteAuthorBookResponseNoContentBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { authorId, bookId } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      await unitOfWork.runInTransaction(async () => {
        await this.deleteAuthorBookCommandHandler.execute({
          unitOfWork,
          authorId,
          bookId,
        });
      });
    } catch (error) {
      if (error instanceof AuthorBookNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.noContent, body: null };
  }
}
