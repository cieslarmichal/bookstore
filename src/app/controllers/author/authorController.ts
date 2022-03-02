import express, { NextFunction, Request, Response } from 'express';
import { AuthorService } from '../../domain/author/services/authorService';
import { CreateAuthorData, UpdateAuthorData } from '../../domain/author/services/types';
import { RecordToInstanceTransformer } from '../../shared';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { authorErrorMiddleware, sendResponseMiddleware } from './middlewares';
import {
  AuthorDto,
  CreateAuthorBodyDto,
  CreateAuthorResponseData,
  CreateAuthorResponseDto,
  FindAuthorResponseData,
  FindAuthorResponseDto,
  RemoveAuthorResponseDto,
  UpdateAuthorBodyDto,
  UpdateAuthorResponseData,
  UpdateAuthorResponseDto,
} from './dtos';
import { ControllerResponse } from '../shared/controllerResponse';

const AUTHORS_PATH = '/authors';
const AUTHORS_PATH_WITH_ID = `${AUTHORS_PATH}/:id`;

export class AuthorController {
  public readonly router = express.Router();

  public constructor(private readonly authorService: AuthorService) {
    this.router.post(
      AUTHORS_PATH,
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const createAuthorResponse = await this.createAuthor(request, response);

        response.locals.controllerResponse = createAuthorResponse;
        next();
      }),
    );
    this.router.get(
      AUTHORS_PATH_WITH_ID,
      asyncHandler(async (request: Request, response: Response) => {
        const findAuthorResponse = await this.findAuthor(request, response);
        response.locals.controllerResponse = findAuthorResponse;
      }),
    );
    this.router.patch(
      AUTHORS_PATH_WITH_ID,
      asyncHandler(async (request: Request, response: Response) => {
        const updateAuthorResponse = await this.updateAuthor(request, response);
        response.locals.controllerResponse = updateAuthorResponse;
      }),
    );
    this.router.delete(
      AUTHORS_PATH_WITH_ID,
      asyncHandler(async (request: Request, response: Response) => {
        const deleteAuthorResponse = await this.deleteAuthor(request, response);
        response.locals.controllerResponse = deleteAuthorResponse;
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(authorErrorMiddleware);
  }

  public async createAuthor(request: Request, response: Response): Promise<ControllerResponse> {
    const createAuthorBodyDto = RecordToInstanceTransformer.transform(request.body, CreateAuthorBodyDto);

    const createAuthorData = RecordToInstanceTransformer.transform(createAuthorBodyDto, CreateAuthorData);

    const authorDto = await this.authorService.createAuthor(createAuthorData);

    const controllerAuthorDto = AuthorDto.create({
      id: authorDto.id,
      createdAt: authorDto.createdAt,
      updatedAt: authorDto.updatedAt,
      firstName: authorDto.firstName,
      lastName: authorDto.lastName,
      about: authorDto.about,
      books: authorDto.books,
    });

    const responseData = CreateAuthorResponseData.create({ author: controllerAuthorDto });

    return CreateAuthorResponseDto.create({ data: responseData, statusCode: StatusCodes.CREATED });
  }

  public async findAuthor(request: Request, response: Response): Promise<ControllerResponse> {
    const authorDto = await this.authorService.findAuthor(request.params.id);

    const responseData = FindAuthorResponseData.create({ author: authorDto });

    return FindAuthorResponseDto.create({ data: responseData, statusCode: StatusCodes.OK });
  }

  public async updateAuthor(request: Request, response: Response): Promise<ControllerResponse> {
    const updateAuthorBodyDto = RecordToInstanceTransformer.transform(request.body, UpdateAuthorBodyDto);

    const updateAuthorData = RecordToInstanceTransformer.transform(updateAuthorBodyDto, UpdateAuthorData);

    const authorDto = await this.authorService.updateAuthor(request.params.id, updateAuthorData);

    const responseData = UpdateAuthorResponseData.create({ author: authorDto });

    return UpdateAuthorResponseDto.create({ data: responseData, statusCode: StatusCodes.OK });
  }

  public async deleteAuthor(request: Request, response: Response): Promise<ControllerResponse> {
    await this.authorService.removeAuthor(request.params.id);

    return RemoveAuthorResponseDto.create({ statusCode: StatusCodes.OK });
  }
}
