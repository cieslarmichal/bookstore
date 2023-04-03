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
import { Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { BookCategoryService } from '../../../application/services/bookCategoryService/bookCategoryService';
import { bookCategoryModuleSymbols } from '../../../bookCategoryModuleSymbols';
import { BookCategory } from '../../../domain/entities/bookCategory/bookCategory';
import { BookCategoryAlreadyExistsError } from '../../errors/bookCategoryAlreadyExistsError';
import { BookCategoryNotFoundError } from '../../errors/bookCategoryNotFoundError';

export class BookCategoryHttpController implements HttpController {
  public readonly basePath = '/books/:bookId/categories/:categoryId';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(bookCategoryModuleSymbols.bookCategoryService)
    private readonly bookCategoryService: BookCategoryService,
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
    HttpCreatedResponse<CreateBookCategoryResponseCreatedBody> | HttpUnprocessableEntityResponse<ResponseErrorBody>
  > {
    const { bookId, categoryId } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let bookCategory: BookCategory | undefined;

    try {
      bookCategory = await unitOfWork.runInTransaction(async () => {
        return this.bookCategoryService.createBookCategory({
          unitOfWork,
          draft: {
            bookId,
            categoryId,
          },
        });
      });
    } catch (error) {
      if (error instanceof BookCategoryAlreadyExistsError) {
        return { statusCode: HttpStatusCode.unprocessableEntity, body: { error } };
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
        await this.bookCategoryService.deleteBookCategory({
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
