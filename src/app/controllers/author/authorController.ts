import express, { Request, Response } from 'express';
import { AuthorService } from '../../domain/author/services/authorService';
import { CreateAuthorData, UpdateAuthorData } from '../../domain/author/services/types';
import { RecordToInstanceTransformer } from '../../shared';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { authorErrorMiddleware } from './middlewares';

const AUTHORS_PATH = '/authors';
const AUTHORS_PATH_WITH_ID = `${AUTHORS_PATH}/:id`;

export class AuthorController {
  public readonly router = express.Router();

  public constructor(private readonly authorService: AuthorService) {
    this.router.post(
      AUTHORS_PATH,
      asyncHandler((request: Request, response: Response) => this.createAuthor(request, response)),
    );
    this.router.get(
      AUTHORS_PATH_WITH_ID,
      asyncHandler((request: Request, response: Response) => this.findAuthor(request, response)),
    );
    this.router.patch(
      AUTHORS_PATH_WITH_ID,
      asyncHandler((request: Request, response: Response) => this.updateAuthor(request, response)),
    );
    this.router.delete(
      AUTHORS_PATH_WITH_ID,
      asyncHandler((request: Request, response: Response) => this.deleteAuthor(request, response)),
    );
    this.router.use(authorErrorMiddleware);
  }

  public async createAuthor(request: Request, response: Response): Promise<void> {
    const createAuthorData = RecordToInstanceTransformer.transform(request.body, CreateAuthorData);

    const authorDto = await this.authorService.createAuthor(createAuthorData);

    response.status(StatusCodes.CREATED).send(authorDto);
  }

  public async findAuthor(request: Request, response: Response): Promise<void> {
    const authorDto = await this.authorService.findAuthor(request.params.id);

    response.status(StatusCodes.OK).send(authorDto);
  }

  public async updateAuthor(request: Request, response: Response): Promise<void> {
    const updateAuthorData = RecordToInstanceTransformer.transform(request.body, UpdateAuthorData);

    const authorDto = await this.authorService.updateAuthor(request.params.id, updateAuthorData);

    response.status(StatusCodes.OK).send(authorDto);
  }

  public async deleteAuthor(request: Request, response: Response): Promise<void> {
    await this.authorService.removeAuthor(request.params.id);

    response.status(StatusCodes.OK).send();
  }
}
