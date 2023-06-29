import {
  createBookCategoryPathParametersSchema,
  createBookCategoryResponseCreatedBodySchema,
  CreateBookCategoryPathParameters,
  CreateBookCategoryResponseCreatedBody,
} from './schemas/createBookCategorySchema';
import {
  deleteBookCategoryPathParametersSchema,
  deleteBookCategoryResponseNoContentBodySchema,
  DeleteBookCategoryPathParameters,
  DeleteBookCategoryResponseNoContentBody,
} from './schemas/deleteBookCategorySchema';
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
import { BookNotFoundError } from '../../../../bookModule/application/errors/bookNotFoundError';
import { CategoryNotFoundError } from '../../../../categoryModule/application/errors/categoryNotFoundError';
import { CreateBookCategoryCommandHandler } from '../../../application/commandHandlers/createBookCategoryCommandHandler/createBookCategoryCommandHandler';
import { DeleteBookCategoryCommandHandler } from '../../../application/commandHandlers/deleteBookCategoryCommandHandler/deleteBookCategoryCommandHandler';
import { BookCategoryAlreadyExistsError } from '../../../application/errors/bookCategoryAlreadyExistsError';
import { BookCategoryNotFoundError } from '../../../application/errors/bookCategoryNotFoundError';
import { BookCategory } from '../../../domain/entities/bookCategory/bookCategory';
import { symbols } from '../../../symbols';

@Injectable()
export class BookCategoryHttpController implements HttpController {
  public readonly basePath = '/books/:bookId/categories/:categoryId';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(symbols.createBookCategoryCommandHandler)
    private readonly createBookCategoryCommandHandler: CreateBookCategoryCommandHandler,
    @Inject(symbols.deleteBookCategoryCommandHandler)
    private readonly deleteBookCategoryCommandHandler: DeleteBookCategoryCommandHandler,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createBookCategory.bind(this),
        schema: {
          request: {
            pathParams: createBookCategoryPathParametersSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createBookCategoryResponseCreatedBodySchema,
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
        handler: this.deleteBookCategory.bind(this),
        schema: {
          request: {
            pathParams: deleteBookCategoryPathParametersSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteBookCategoryResponseNoContentBodySchema,
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

  private async createBookCategory(
    request: HttpRequest<undefined, undefined, CreateBookCategoryPathParameters>,
  ): Promise<
    | HttpCreatedResponse<CreateBookCategoryResponseCreatedBody>
    | HttpUnprocessableEntityResponse<ResponseErrorBody>
    | HttpNotFoundResponse<ResponseErrorBody>
  > {
    const { bookId, categoryId } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let bookCategory: BookCategory | undefined;

    try {
      const result = await unitOfWork.runInTransaction(async () => {
        return this.createBookCategoryCommandHandler.execute({
          unitOfWork,
          draft: {
            bookId,
            categoryId,
          },
        });
      });

      bookCategory = result.bookCategory;
    } catch (error) {
      if (error instanceof BookCategoryAlreadyExistsError) {
        return { statusCode: HttpStatusCode.unprocessableEntity, body: { error } };
      }

      if (error instanceof CategoryNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      if (error instanceof BookNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.created, body: { bookCategory } };
  }

  private async deleteBookCategory(
    request: HttpRequest<undefined, undefined, DeleteBookCategoryPathParameters>,
  ): Promise<HttpNoContentResponse<DeleteBookCategoryResponseNoContentBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { bookId, categoryId } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      await unitOfWork.runInTransaction(async () => {
        await this.deleteBookCategoryCommandHandler.execute({
          unitOfWork,
          bookId,
          categoryId,
        });
      });
    } catch (error) {
      if (error instanceof BookCategoryNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.noContent, body: null };
  }
}
