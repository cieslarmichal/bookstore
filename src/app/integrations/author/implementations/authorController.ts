/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';

import { authorErrorMiddleware } from './authorErrorMiddleware';
import { HttpStatusCode } from '../../../common/http/contracts/httpStatusCode';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { authorSymbols } from '../../../domain/author/authorSymbols';
import { Author } from '../../../domain/author/contracts/author';
import { AuthorService } from '../../../domain/author/contracts/services/authorService/authorService';
import { CreateAuthorDraft } from '../../../domain/author/contracts/services/authorService/createAuthorDraft';
import { Injectable, Inject } from '../../../libs/dependencyInjection/contracts/decorators';
import { UnitOfWorkFactory } from '../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkSymbols } from '../../../libs/unitOfWork/unitOfWorkSymbols';
import { FilterDataParser } from '../../common/filterDataParser/filterDataParser';
import { AuthMiddleware } from '../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../common/middlewares/sendResponseMiddleware';
import { PaginationDataBuilder } from '../../common/paginationDataBuilder/paginationDataBuilder';
import { ControllerResponse } from '../../controllerResponse';
import { integrationsSymbols } from '../../integrationsSymbols';
import { LocalsName } from '../../localsName';
import { QueryParameterName } from '../../queryParameterName';
import { CreateAuthorPayload, createAuthorPayloadSchema } from '../contracts/createAuthorPayload';
import { DeleteAuthorPayload, deleteAuthorPayloadSchema } from '../contracts/deleteAuthorPayload';
import { FindAuthorPayload, findAuthorPayloadSchema } from '../contracts/findAuthorPayload';
import { findAuthorsFilters } from '../contracts/findAuthorsFilters';
import { FindAuthorsPayload, findAuthorsPayloadSchema } from '../contracts/findAuthorsPayload';
import { UpdateAuthorPayload, updateAuthorPayloadSchema } from '../contracts/updateAuthorPayload';

@Injectable()
export class AuthorController {
  public readonly router = Router();
  private readonly authorsEndpoint = '/authors';
  private readonly authorEndpoint = `${this.authorsEndpoint}/:id`;

  public constructor(
    @Inject(unitOfWorkSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(authorSymbols.authorService)
    private readonly authorService: AuthorService,
    @Inject(integrationsSymbols.authMiddleware)
    authMiddleware: AuthMiddleware,
    @Inject(integrationsSymbols.filterDataParser)
    private filterDataParser: FilterDataParser,
    @Inject(integrationsSymbols.paginationDataBuilder)
    private paginationDataBuilder: PaginationDataBuilder,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      this.authorsEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { firstName, lastName, about } = request.body;

        const author = await this.createAuthor({ firstName, lastName, about });

        const controllerResponse: ControllerResponse = { data: { author }, statusCode: HttpStatusCode.created };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.authorEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const author = await this.findAuthor({ id: id as string });

        const controllerResponse: ControllerResponse = { data: { author }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.authorsEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const filtersInput = request.query[QueryParameterName.filter] as string;

        const filters = filtersInput
          ? this.filterDataParser.parse({
              jsonData: filtersInput,
              supportedFieldsFilters: findAuthorsFilters,
            })
          : [];

        const page = Number(request.query[QueryParameterName.page] ?? 0);

        const limit = Number(request.query[QueryParameterName.limit] ?? 0);

        const pagination = this.paginationDataBuilder.build({ page, limit });

        const authors = await this.findAuthors({ filters, pagination });

        const controllerResponse: ControllerResponse = { data: { authors }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.patch(
      this.authorEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const { about } = request.body;

        const author = await this.updateAuthor({ id: id as string, about });

        const controllerResponse: ControllerResponse = { data: { author }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;
        next();
      }),
    );

    this.router.delete(
      this.authorEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        await this.deleteAuthor({ id: id as string });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.use(sendResponseMiddleware);

    this.router.use(authorErrorMiddleware);
  }

  private async createAuthor(input: CreateAuthorPayload): Promise<Author> {
    const { firstName, lastName, about } = PayloadFactory.create(createAuthorPayloadSchema, input);

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

    return author;
  }

  private async findAuthor(input: FindAuthorPayload): Promise<Author> {
    const { id } = PayloadFactory.create(findAuthorPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const author = await unitOfWork.runInTransaction(async () => {
      return this.authorService.findAuthor({ unitOfWork, authorId: id as string });
    });

    return author;
  }

  private async findAuthors(input: FindAuthorsPayload): Promise<Author[]> {
    const { filters, pagination } = PayloadFactory.create(findAuthorsPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const authors = await unitOfWork.runInTransaction(async () => {
      return this.authorService.findAuthors({ unitOfWork, filters, pagination });
    });

    return authors;
  }

  private async updateAuthor(input: UpdateAuthorPayload): Promise<Author> {
    const { id, about } = PayloadFactory.create(updateAuthorPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const author = await unitOfWork.runInTransaction(async () => {
      return this.authorService.updateAuthor({ unitOfWork, authorId: id as string, draft: { about } });
    });

    return author;
  }

  private async deleteAuthor(input: DeleteAuthorPayload): Promise<void> {
    const { id } = PayloadFactory.create(deleteAuthorPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      await this.authorService.deleteAuthor({ unitOfWork, authorId: id as string });
    });
  }
}
