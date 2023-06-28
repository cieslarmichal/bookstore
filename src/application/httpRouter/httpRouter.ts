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
import { AddressHttpController } from '../modules/addressModule/api/httpControllers/addressHttpController/addressHttpController';
import { addressSymbols } from '../modules/addressModule/symbols';
import { AuthorBookHttpController } from '../modules/authorBookModule/api/httpControllers/authorBookHttpController/authorBookHttpController';
import { authorBookSymbols } from '../modules/authorBookModule/symbols';
import { AuthorHttpController } from '../modules/authorModule/api/httpControllers/authorHttpController/authorHttpController';
import { authorSymbols } from '../modules/authorModule/symbols';
import { BookCategoryHttpController } from '../modules/bookCategoryModule/api/httpControllers/bookCategoryHttpController/bookCategoryHttpController';
import { bookCategorySymbols } from '../modules/bookCategoryModule/symbols';
import { BookHttpController } from '../modules/bookModule/api/httpControllers/bookHttpController/bookHttpController';
import { bookSymbols } from '../modules/bookModule/symbols';
import { CategoryHttpController } from '../modules/categoryModule/api/httpControllers/categoryHttpController/categoryHttpController';
import { categorySymbols } from '../modules/categoryModule/symbols';
import { CustomerHttpController } from '../modules/customerModule/api/httpControllers/customerHttpController/customerHttpController';
import { customerSymbols } from '../modules/customerModule/symbols';
import { InventoryHttpController } from '../modules/inventoryModule/api/httpControllers/inventoryHttpController/inventoryHttpController';
import { inventorySymbols } from '../modules/inventoryModule/symbols';
import { CartHttpController } from '../modules/orderModule/api/httpControllers/cartHttpController/cartHttpController';
import { OrderHttpController } from '../modules/orderModule/api/httpControllers/orderController/orderHttpController/orderHttpController';
import { orderSymbols } from '../modules/orderModule/symbols';
import { ReviewHttpController } from '../modules/reviewModule/api/httpControllers/reviewHttpController/reviewHttpController';
import { reviewSymbols } from '../modules/reviewModule/symbols';
import { UserHttpController } from '../modules/userModule/api/httpControllers/userHttpController/userHttpController';
import { TokenService } from '../modules/userModule/application/services/tokenService/tokenService';
import { userSymbols } from '../modules/userModule/symbols';
import { WhishlistHttpController } from '../modules/whishlistModule/api/httpControllers/whishlistHttpController/whishlistHttpController';
import { whishlistSymbols } from '../modules/whishlistModule/symbols';

export class HttpRouter {
  private readonly rootPath = '';
  private readonly bearerTokenAuthorizer: BearerTokenAuthorizer;
  private readonly loggerService: LoggerService;

  public constructor(
    private readonly server: FastifyInstance,
    private readonly container: DependencyInjectionContainer,
  ) {
    const tokenService = this.container.get<TokenService>(userSymbols.tokenService);

    this.bearerTokenAuthorizer = new BearerTokenAuthorizer(tokenService);

    this.loggerService = this.container.get<LoggerService>(loggerModuleSymbols.loggerService);
  }

  public registerAllRoutes(): void {
    const addressHttpController = this.container.get<AddressHttpController>(addressSymbols.addressHttpController);

    this.registerControllerRoutes({ controller: addressHttpController });

    const authorBookHttpController = this.container.get<AuthorBookHttpController>(
      authorBookSymbols.authorBookHttpController,
    );

    this.registerControllerRoutes({ controller: authorBookHttpController });

    const bookCategoryHttpController = this.container.get<BookCategoryHttpController>(
      bookCategorySymbols.bookCategoryHttpController,
    );

    this.registerControllerRoutes({ controller: bookCategoryHttpController });

    const authorHttpController = this.container.get<AuthorHttpController>(authorSymbols.authorHttpController);

    this.registerControllerRoutes({ controller: authorHttpController });

    const bookHttpController = this.container.get<BookHttpController>(bookSymbols.bookHttpController);

    this.registerControllerRoutes({ controller: bookHttpController });

    const categoryHttpController = this.container.get<CategoryHttpController>(categorySymbols.categoryHttpController);

    this.registerControllerRoutes({ controller: categoryHttpController });

    const customerHttpController = this.container.get<CustomerHttpController>(customerSymbols.customerHttpController);

    this.registerControllerRoutes({ controller: customerHttpController });

    const inventoryHttpController = this.container.get<InventoryHttpController>(
      inventorySymbols.inventoryHttpController,
    );

    this.registerControllerRoutes({ controller: inventoryHttpController });

    const reviewHttpController = this.container.get<ReviewHttpController>(reviewSymbols.reviewHttpController);

    this.registerControllerRoutes({ controller: reviewHttpController });

    const cartHttpController = this.container.get<CartHttpController>(orderSymbols.cartHttpController);

    this.registerControllerRoutes({ controller: cartHttpController });

    const orderHttpController = this.container.get<OrderHttpController>(orderSymbols.orderHttpController);

    this.registerControllerRoutes({ controller: orderHttpController });

    const whishlistHttpController = this.container.get<WhishlistHttpController>(
      whishlistSymbols.whishlistHttpController,
    );

    this.registerControllerRoutes({ controller: whishlistHttpController });

    const userHttpController = this.container.get<UserHttpController>(userSymbols.userHttpController);

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
          let requestBody = JSON.parse(fastifyRequest.body as string) || {};

          let pathParams = (fastifyRequest.params || {}) as Record<string, string>;

          let queryParams = (fastifyRequest.query || {}) as Record<string, string | number>;

          if (schema.request.body) {
            requestBody = Validator.validate(schema.request.body, requestBody);
          }

          if (schema.request.pathParams) {
            pathParams = Validator.validate(schema.request.pathParams, pathParams);
          }

          if (schema.request.queryParams) {
            queryParams = Validator.validate(schema.request.queryParams, queryParams);
          }

          let context: RequestContext = {};

          if (authorizationType === AuthorizationType.bearerToken) {
            context = this.bearerTokenAuthorizer.extractAuthorizationContextFromAuthorizationHeader(
              fastifyRequest.headers.authorization,
            );
          }

          this.loggerService.debug({
            message: 'Received an HTTP request.',
            context: {
              path,
              method,
              requestBody,
              pathParams,
              queryParams,
              context,
            },
          });

          const { statusCode, body: responseBody } = await handler({
            body: requestBody,
            pathParams,
            queryParams,
            context,
          });

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
