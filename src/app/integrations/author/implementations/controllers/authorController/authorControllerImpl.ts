/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatusCode } from '../../../../../common/http/httpStatusCode';
import { AuthorService } from '../../../../../domain/author/contracts/services/authorService/authorService';
import { UnitOfWorkFactory } from '../../../../../libs/unitOfWork/unitOfWorkFactory';
import { FilterDataParser } from '../../../../common/filter/filterDataParser';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { PaginationDataParser } from '../../../../common/paginationData/paginationDataParser';
import { ControllerResponse } from '../../../../controllerResponse';
import { AuthorController } from '../../../contracts/controllers/authorController/authorController';
import { findAuthorsFilters } from '../../../contracts/controllers/authorController/findAuthorsFilters';
import { authorErrorMiddleware } from '../../middlewares/authorErrorMiddleware/authorErrorMiddleware';

const authorsEndpoint = '/authors';
const authorEndpoint = `${authorsEndpoint}/:id`;

export class AuthorControllerImpl implements AuthorController {
  public readonly router = Router();

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly authorService: AuthorService,
    authMiddleware: AuthMiddleware,
    private filterDataParser: FilterDataParser,
    private paginationDataParser: PaginationDataParser,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      authorsEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const createAuthorResponse = await this.createAuthor(request, response);
        response.locals['controllerResponse'] = createAuthorResponse;
        next();
      }),
    );
    this.router.get(
      authorEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findAuthorResponse = await this.findAuthor(request, response);
        response.locals['controllerResponse'] = findAuthorResponse;
        next();
      }),
    );
    this.router.get(
      authorsEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findAuthorsResponse = await this.findAuthors(request, response);
        response.locals['controllerResponse'] = findAuthorsResponse;
        next();
      }),
    );
    this.router.patch(
      authorEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const updateAuthorResponse = await this.updateAuthor(request, response);
        response.locals['controllerResponse'] = updateAuthorResponse;
        next();
      }),
    );
    this.router.delete(
      authorEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const deleteAuthorResponse = await this.deleteAuthor(request, response);
        response.locals['controllerResponse'] = deleteAuthorResponse;
        next();
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(authorErrorMiddleware);
  }

  public async createAuthor(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { firstName, lastName, about } = request.body;

    const author = await unitOfWork.runInTransaction(async () => {
      return this.authorService.createAuthor(unitOfWork, { firstName, lastName, about });
    });

    return { data: { author }, statusCode: HttpStatusCode.created };
  }

  public async findAuthor(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = request.params;

    const author = await unitOfWork.runInTransaction(async () => {
      return this.authorService.findAuthor(unitOfWork, id as string);
    });

    return { data: { author }, statusCode: HttpStatusCode.ok };
  }

  public async findAuthors(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const filters = this.filterDataParser.parse(request.query['filter'] as string, findAuthorsFilters);

    const pagination = this.paginationDataParser.parse(request.query);

    const authors = await unitOfWork.runInTransaction(async () => {
      return this.authorService.findAuthors(unitOfWork, filters, pagination);
    });

    return { data: { authors }, statusCode: HttpStatusCode.ok };
  }

  public async updateAuthor(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = request.params;

    const { about } = request.body;

    const author = await unitOfWork.runInTransaction(async () => {
      return this.authorService.updateAuthor(unitOfWork, id as string, { about });
    });

    return { data: { author }, statusCode: HttpStatusCode.ok };
  }

  public async deleteAuthor(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = request.params;

    await unitOfWork.runInTransaction(async () => {
      await this.authorService.removeAuthor(unitOfWork, id as string);
    });

    return { statusCode: HttpStatusCode.noContent };
  }
}
