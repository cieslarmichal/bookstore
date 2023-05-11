import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { BearerTokenAuthorizer } from './authorizers/bearerTokenAuthorizer/bearerTokenAuthorizer';
import { BearerTokenAuthorizationError } from './authorizers/errors/bearerTokenAuthorizationError';
import { NormalizeUrlPayload, normalizeUrlPayloadSchema } from './payloads/normalizeUrlPayload';
import {
  RegisterControllerRoutesPayload,
  registerControllerRoutesPayloadSchema,
} from './payloads/registerControllerRoutesPayload';
import { RegisterRoutesPayload, registerRoutesPayloadSchema } from './payloads/registerRoutesPayload';
import { ApplicationError } from '../../common/errors/applicationError';
import { BaseError } from '../../common/errors/baseError';
import { DomainError } from '../../common/errors/domainError';
import { AuthorizationType } from '../../common/http/authorizationType';
import { HttpStatusCode } from '../../common/http/httpStatusCode';
import { RequestContext } from '../../common/http/requestContext';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer';
import { loggerModuleSymbols } from '../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../libs/validator/validator';
import { AddressHttpController } from '../modules/addressModule/infrastructure/httpControllers/addressHttpController/addressHttpController';
import { addressModuleSymbols } from '../modules/addressModule/symbols';
import { authorBookModuleSymbols } from '../modules/authorBookModule/authorBookModuleSymbols';
import { AuthorBookHttpController } from '../modules/authorBookModule/infrastructure/httpControllers/authorBookHttpController/authorBookHttpController';
import { authorModuleSymbols } from '../modules/authorModule/authorModuleSymbols';
import { AuthorHttpController } from '../modules/authorModule/infrastructure/httpControllers/authorHttpController/authorHttpController';
import { bookCategoryModuleSymbols } from '../modules/bookCategoryModule/bookCategoryModuleSymbols';
import { BookCategoryHttpController } from '../modules/bookCategoryModule/infrastructure/httpControllers/bookCategoryHttpController/bookCategoryHttpController';
import { bookModuleSymbols } from '../modules/bookModule/bookModuleSymbols';
import { BookHttpController } from '../modules/bookModule/infrastructure/httpControllers/bookHttpController/bookHttpController';
import { categoryModuleSymbols } from '../modules/categoryModule/categoryModuleSymbols';
import { CategoryHttpController } from '../modules/categoryModule/infrastructure/httpControllers/categoryHttpController/categoryHttpController';
import { customerModuleSymbols } from '../modules/customerModule/customerModuleSymbols';
import { CustomerHttpController } from '../modules/customerModule/infrastructure/httpControllers/customerHttpController/customerHttpController';
import { InventoryHttpController } from '../modules/inventoryModule/infrastructure/httpControllers/inventoryHttpController/inventoryHttpController';
import { inventoryModuleSymbols } from '../modules/inventoryModule/inventoryModuleSymbols';
import { CartHttpController } from '../modules/orderModule/infrastructure/httpControllers/cartHttpController/cartHttpController';
import { OrderHttpController } from '../modules/orderModule/infrastructure/httpControllers/orderController/orderHttpController/orderHttpController';
import { orderModuleSymbols } from '../modules/orderModule/orderModuleSymbols';
import { ReviewHttpController } from '../modules/reviewModule/infrastructure/httpControllers/reviewHttpController/reviewHttpController';
import { reviewModuleSymbols } from '../modules/reviewModule/reviewModuleSymbols';
import { TokenService } from '../modules/userModule/application/services/tokenService/tokenService';
import { UserHttpController } from '../modules/userModule/infrastructure/httpControllers/userHttpController/userHttpController';
import { userModuleSymbols } from '../modules/userModule/userModuleSymbols';
import { WhishlistHttpController } from '../modules/whishlistModule/infrastructure/httpControllers/whishlistHttpController/whishlistHttpController';
import { whishlistModuleSymbols } from '../modules/whishlistModule/whishlistModuleSymbols';

export class HttpRouter {
  private readonly rootPath = '';
  private readonly bearerTokenAuthorizer: BearerTokenAuthorizer;
  private readonly loggerService: LoggerService;

  public constructor(
    private readonly server: FastifyInstance,
    private readonly container: DependencyInjectionContainer,
  ) {
    const tokenService = this.container.get<TokenService>(userModuleSymbols.tokenService);

    this.bearerTokenAuthorizer = new BearerTokenAuthorizer(tokenService);

    this.loggerService = this.container.get<LoggerService>(loggerModuleSymbols.loggerService);
  }

  public registerAllRoutes(): void {
    const addressHttpController = this.container.get<AddressHttpController>(addressModuleSymbols.addressHttpController);

    this.registerControllerRoutes({ controller: addressHttpController });

    const authorBookHttpController = this.container.get<AuthorBookHttpController>(
      authorBookModuleSymbols.authorBookHttpController,
    );

    this.registerControllerRoutes({ controller: authorBookHttpController });

    const bookCategoryHttpController = this.container.get<BookCategoryHttpController>(
      bookCategoryModuleSymbols.bookCategoryHttpController,
    );

    this.registerControllerRoutes({ controller: bookCategoryHttpController });

    const authorHttpController = this.container.get<AuthorHttpController>(authorModuleSymbols.authorHttpController);

    this.registerControllerRoutes({ controller: authorHttpController });

    const bookHttpController = this.container.get<BookHttpController>(bookModuleSymbols.bookHttpController);

    this.registerControllerRoutes({ controller: bookHttpController });

    const categoryHttpController = this.container.get<CategoryHttpController>(
      categoryModuleSymbols.categoryHttpController,
    );

    this.registerControllerRoutes({ controller: categoryHttpController });

    const customerHttpController = this.container.get<CustomerHttpController>(
      customerModuleSymbols.customerHttpController,
    );

    this.registerControllerRoutes({ controller: customerHttpController });

    const inventoryHttpController = this.container.get<InventoryHttpController>(
      inventoryModuleSymbols.inventoryHttpController,
    );

    this.registerControllerRoutes({ controller: inventoryHttpController });

    const reviewHttpController = this.container.get<ReviewHttpController>(reviewModuleSymbols.reviewHttpController);

    this.registerControllerRoutes({ controller: reviewHttpController });

    const cartHttpController = this.container.get<CartHttpController>(orderModuleSymbols.cartHttpController);

    this.registerControllerRoutes({ controller: cartHttpController });

    const orderHttpController = this.container.get<OrderHttpController>(orderModuleSymbols.orderHttpController);

    this.registerControllerRoutes({ controller: orderHttpController });

    const whishlistHttpController = this.container.get<WhishlistHttpController>(
      whishlistModuleSymbols.whishlistHttpController,
    );

    this.registerControllerRoutes({ controller: whishlistHttpController });

    const userHttpController = this.container.get<UserHttpController>(userModuleSymbols.userHttpController);

    this.registerControllerRoutes({ controller: userHttpController });
  }

  private registerControllerRoutes(input: RegisterControllerRoutesPayload): void {
    const { controller } = Validator.validate(registerControllerRoutesPayloadSchema, input);

    const { basePath } = controller;

    const routes = controller.getHttpRoutes();

    this.registerRoutes({ routes, basePath });
  }

  private registerRoutes(input: RegisterRoutesPayload): void {
    const { routes, basePath } = Validator.validate(registerRoutesPayloadSchema, input);

    routes.map(({ path, method, handler, schema, authorizationType }) => {
      const fastifyHandler = async (fastifyRequest: FastifyRequest, fastifyReply: FastifyReply): Promise<void> => {
        try {
          const requestBody = fastifyRequest.body || {};

          const pathParams = (fastifyRequest.params || {}) as Record<string, string>;

          const queryParams = (fastifyRequest.query || {}) as Record<string, string | number>;

          this.loggerService.debug({
            message: 'Received an HTTP request.',
            context: {
              path,
              method,
              body: requestBody,
              pathParams,
              queryParams,
            },
          });

          if (schema.request.body) {
            Validator.validate(schema.request.body, requestBody);
          }

          if (schema.request.pathParams) {
            Validator.validate(schema.request.pathParams, pathParams);
          }

          const normalizedQueryParams: Record<string, string | number> = {};

          for (const key in queryParams) {
            const queryParamValue = queryParams[key];

            const normalizedValue = Number.isNaN(queryParamValue) ? String(queryParamValue) : Number(queryParamValue);

            normalizedQueryParams[key] = normalizedValue;
          }

          if (schema.request.queryParams) {
            Validator.validate(schema.request.queryParams, normalizedQueryParams);
          }

          let context: RequestContext = {};

          if (authorizationType === AuthorizationType.bearerToken) {
            context = this.bearerTokenAuthorizer.extractAuthorizationContextFromAuthorizationHeader(
              fastifyRequest.headers.authorization,
            );
          }

          const { statusCode, body: responseBody } = await handler({
            body: requestBody,
            pathParams,
            queryParams: normalizedQueryParams,
            context,
          });

          const responseSchema = schema.response[String(statusCode)]?.schema;

          if (responseSchema) {
            Validator.validate(responseSchema, queryParams);
          }

          fastifyReply.status(statusCode);

          if (!responseBody) {
            fastifyReply.send();

            return;
          }

          fastifyReply.send({ ...responseBody });

          this.loggerService.debug({
            message: 'Send an HTTP response.',
            context: {
              path,
              method,
              statusCode,
              body: responseBody,
            },
          });
        } catch (error) {
          if (error instanceof BearerTokenAuthorizationError) {
            const formattedError: Record<string, unknown> = {
              name: error.name,
              message: error.message,
              context: error.context,
            };

            fastifyReply.status(HttpStatusCode.unauthorized).send({
              error: formattedError,
            });

            return;
          }

          if (error instanceof BaseError) {
            const formattedError: Record<string, unknown> = {
              name: error.name,
              message: error.message,
              context: error.context,
            };

            this.loggerService.error({
              message: 'Caught an error in the HTTP router.',
              context: {
                error: formattedError,
              },
            });

            if (error instanceof ApplicationError) {
              fastifyReply.status(HttpStatusCode.badRequest).send({
                error: formattedError,
              });

              return;
            }

            if (error instanceof DomainError) {
              fastifyReply.status(HttpStatusCode.badRequest).send({
                error: formattedError,
              });

              return;
            }

            fastifyReply.status(HttpStatusCode.internalServerError).send({
              error: {
                name: 'InternalServerError',
                message: 'Internal server error',
              },
            });

            return;
          }

          this.loggerService.error({
            message: 'Caught an unknown error in the HTTP router.',
            context: {
              error,
            },
          });

          fastifyReply.status(HttpStatusCode.internalServerError).send({
            error: {
              name: 'InternalServerError',
              message: 'Internal server error',
            },
          });

          return;
        }
      };

      const url = `/${this.rootPath}/${basePath}/${path}`;

      const normalizedUrl = this.normalizeUrl({ url });

      this.server.route({ method, url: normalizedUrl, handler: fastifyHandler });
    });
  }

  private normalizeUrl(input: NormalizeUrlPayload): string {
    const { url } = Validator.validate(normalizeUrlPayloadSchema, input);

    const urlWithoutDoubleSlashes = url.replace(/(\/+)/g, '/');

    const urlWithoutTrailingSlash = urlWithoutDoubleSlashes.replace(/(\/)$/g, '');

    return urlWithoutTrailingSlash;
  }
}
