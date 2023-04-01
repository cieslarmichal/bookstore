import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { NormalizeUrlPayload, normalizeUrlPayloadSchema } from './payloads/normalizeUrlPayload.js';
import {
  RegisterControllerRoutesPayload,
  registerControllerRoutesPayloadSchema,
} from './payloads/registerControllerRoutesPayload.js';
import { RegisterRoutesPayload, registerRoutesPayloadSchema } from './payloads/registerRoutesPayload.js';
import { blockchainModuleSymbols } from '../blockchainModule/blockchainModuleSymbols.js';
import { BlockchainHttpController } from '../blockchainModule/infrastructure/httpControllers/blockchainHttpController/blockchainHttpController.js';
import { ApplicationError } from '../common/errors/applicationError.js';
import { BaseError } from '../common/errors/baseError.js';
import { DomainError } from '../common/errors/domainError.js';
import { HttpStatusCode } from '../common/http/httpStatusCode.js';
import { DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { loggerModuleSymbols } from '../libs/logger/loggerModuleSymbols.js';
import { LoggerService } from '../libs/logger/services/loggerService/loggerService.js';
import { Validator } from '../libs/validator/validator.js';

export class HttpRouter {
  private readonly rootPath = '';
  private readonly loggerService: LoggerService;

  public constructor(
    private readonly server: FastifyInstance,
    private readonly container: DependencyInjectionContainer,
  ) {
    this.loggerService = this.container.get<LoggerService>(loggerModuleSymbols.loggerService);
  }

  public registerAllRoutes(): void {
    const blockchainHttpController = this.container.get<BlockchainHttpController>(
      blockchainModuleSymbols.blockchainHttpController,
    );

    this.registerControllerRoutes({ controller: blockchainHttpController });
  }

  private registerControllerRoutes(input: RegisterControllerRoutesPayload): void {
    const { controller } = Validator.validate(registerControllerRoutesPayloadSchema, input);

    const { basePath } = controller;

    const routes = controller.getHttpRoutes();

    this.registerRoutes({ routes, basePath });
  }

  private registerRoutes(input: RegisterRoutesPayload): void {
    const { routes, basePath } = Validator.validate(registerRoutesPayloadSchema, input);

    routes.map(({ path, method, handler, schema }) => {
      const fastifyHandler = async (fastifyRequest: FastifyRequest, fastifyReply: FastifyReply): Promise<void> => {
        try {
          const requestBody = fastifyRequest.body || {};

          const pathParams = (fastifyRequest.params || {}) as Record<string, string>;

          const queryParams = (fastifyRequest.query || {}) as Record<string, string>;

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

          if (schema.request.queryParams) {
            Validator.validate(schema.request.queryParams, queryParams);
          }

          const { statusCode, body: responseBody } = await handler({ body: requestBody, pathParams, queryParams });

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
