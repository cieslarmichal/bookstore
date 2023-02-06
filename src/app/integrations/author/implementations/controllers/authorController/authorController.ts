/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatusCode } from '../../../../../common/http/contracts/httpStatusCode';
import { Author } from '../../../../../domain/author/contracts/author';
import { AuthorService } from '../../../../../domain/author/contracts/services/authorService/authorService';
import { CreateAuthorDraft } from '../../../../../domain/author/contracts/services/authorService/createAuthorDraft';
import { UnitOfWorkFactory } from '../../../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { FilterDataParser } from '../../../../common/filterDataParser/filterDataParser';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { PaginationDataBuilder } from '../../../../common/paginationDataBuilder/paginationDataBuilder';
import { ControllerResponse } from '../../../../controllerResponse';
import { LocalsName } from '../../../../localsName';
import { QueryParameterName } from '../../../../queryParameterName';
import { CreateAuthorPayload } from '../../../contracts/controllers/authorController/createAuthorPayload';
import { DeleteAuthorPayload } from '../../../contracts/controllers/authorController/deleteAuthorPayload';
import { FindAuthorPayload } from '../../../contracts/controllers/authorController/findAuthorPayload';
import { findAuthorsFilters } from '../../../contracts/controllers/authorController/findAuthorsFilters';
import { FindAuthorsPayload } from '../../../contracts/controllers/authorController/findAuthorsPayload';
import { UpdateAuthorPayload } from '../../../contracts/controllers/authorController/updateAuthorPayload';
import { authorErrorMiddleware } from '../../middlewares/authorErrorMiddleware/authorErrorMiddleware';

export class AuthorController {
  public readonly router = Router();
  private readonly authorsEndpoint = '/authors';
  private readonly authorEndpoint = `${this.authorsEndpoint}/:id`;

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly authorService: AuthorService,
    authMiddleware: AuthMiddleware,
    private filterDataParser: FilterDataParser,
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
        const filters = this.filterDataParser.parse({
          jsonData: request.query[QueryParameterName.filter] as string,
          supportedFieldsFilters: findAuthorsFilters,
        });

        const page = Number(request.query[QueryParameterName.page]);

        const limit = Number(request.query[QueryParameterName.limit]);

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
    const { firstName, lastName, about } = input;

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
    const { id } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const author = await unitOfWork.runInTransaction(async () => {
      return this.authorService.findAuthor({ unitOfWork, authorId: id as string });
    });

    return author;
  }

  private async findAuthors(input: FindAuthorsPayload): Promise<Author[]> {
    const { filters, pagination } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const authors = await unitOfWork.runInTransaction(async () => {
      return this.authorService.findAuthors({ unitOfWork, filters, pagination });
    });

    return authors;
  }

  private async updateAuthor(input: UpdateAuthorPayload): Promise<Author> {
    const { id, about } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const author = await unitOfWork.runInTransaction(async () => {
      return this.authorService.updateAuthor({ unitOfWork, authorId: id as string, draft: { about } });
    });

    return author;
  }

  private async deleteAuthor(input: DeleteAuthorPayload): Promise<void> {
    const { id } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      await this.authorService.deleteAuthor({ unitOfWork, authorId: id as string });
    });
  }
}
