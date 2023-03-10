import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { NormalizeUrlPayload, normalizeUrlPayloadSchema } from './payloads/normalizeUrlPayload.js';
import {
  RegisterControllerRoutesPayload,
  registerControllerRoutesPayloadSchema,
} from './payloads/registerControllerRoutesPayload.js';
import { RegisterRoutesPayload, registerRoutesPayloadSchema } from './payloads/registerRoutesPayload.js';
import { LoggerService } from '../libs/logger/contracts/services/loggerService/loggerService.js';

export class HttpRouter {
  private readonly rootPath = '';
  private readonly loggerService: LoggerService;

  public constructor(private readonly server: FastifyInstance, private readonly container: Container) {
    this.loggerService = this.container.get<LoggerService>(loggerSymbols.loggerService);
  }

  public registerAllRoutes(): void {
  }

  private registerControllerRoutes(input: RegisterControllerRoutesPayload): void {
    const { controller } = Validator.validate(registerControllerRoutesPayloadSchema, input);

    const { basePath } = controller;

    const routes = controller.getHttpRoutes();

    this.registerRoutes({ routes, basePath });
  }

  private registerRoutes(input: RegisterRoutesPayload): void {
    const { routes, basePath } = Validator.validate(registerRoutesPayloadSchema, input);

    routes.map(({ path, method, handler, requestSchema, responseSchema }) => {
      const fastifyHandler = async (fastifyRequest: FastifyRequest, fastifyReply: FastifyReply): Promise<void> => {
        try {
          const requestBody = fastifyRequest.body || {};

          const pathParams = (fastifyRequest.params || {}) as Record<string, string>;

          const queryParams = (fastifyRequest.query || {}) as Record<string, string>;

          const queryParamsKeys = Object.keys(queryParams);

          const normalizedQueryParams: Record<string, string | number> = {};

          queryParamsKeys.map((queryParamKey) => {
            const queryParamValue = queryParams[queryParamKey] as string;

            if (isNaN(Number(queryParamValue))) {
              normalizedQueryParams[queryParamKey] = queryParamValue;
            } else {
              normalizedQueryParams[queryParamKey] = Number(queryParamValue);
            }
          });

          if (requestSchema) {
            const { bodySchema, queryParamsSchema } = requestSchema;

            if (bodySchema) {
              Validator.validate(bodySchema, requestBody);
            }

            if (queryParamsSchema) {
              Validator.validate(queryParamsSchema, normalizedQueryParams);
            }
          }

          const { statusCode, body: responseBody } = await handler({
            body: requestBody,
            pathParams,
            queryParams: normalizedQueryParams,
          });

          fastifyReply.status(statusCode);

          if (!responseBody) {
            fastifyReply.send();

            return;
          }

          if (responseSchema) {
            Validator.validate(responseSchema.bodySchema, responseBody);
          }

          fastifyReply.send({ ...responseBody });
        } catch (error) {
          const errorName = error instanceof Error ? error.name : undefined;
          const errorMessage = error instanceof Error ? error.message : undefined;
          const errorStack = error instanceof Error ? error.stack : undefined;
          const errorCause = error instanceof Error ? error.cause : undefined;
          const errorContext = error instanceof BaseError ? error.context : undefined;

          this.loggerService.error({
            message: 'Caught error in HTTP router.',
            context: {
              errorName,
              errorMessage,
              errorStack,
              errorCause,
              errorContext,
            },
          });

          if (error instanceof ApplicationError) {
            fastifyReply.status(HttpStatusCode.badRequest).send({ errorMessage, errorContext, errorName });

            return;
          }

          if (error instanceof DomainError) {
            fastifyReply.status(HttpStatusCode.badRequest).send({ errorMessage, errorContext, errorName });

            return;
          }

          fastifyReply.status(HttpStatusCode.internalServerError).send();
        }
      };

      const url = `/${this.rootPath}/${basePath}/${path}`;

      const normalizedUrl = this.normalizeUrl({ url });

      this.server.route({ method, url: normalizedUrl, handler: fastifyHandler, schema: {} });
    });
  }

  private normalizeUrl(input: NormalizeUrlPayload): string {
    const { url } = Validator.validate(normalizeUrlPayloadSchema, input);

    const urlWithoutDoubleSlashes = url.replace(/(\/+)/g, '/');

    const urlWithoutTrailingSlash = urlWithoutDoubleSlashes.replace(/(\/)$/g, '');

    return urlWithoutTrailingSlash;
  }
}
