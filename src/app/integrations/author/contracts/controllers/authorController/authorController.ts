import { Request, Response } from 'express';
import { ControllerResponse } from '../../../../controllerResponse';

export interface AuthorController {
  createAuthor(request: Request, response: Response): Promise<ControllerResponse>;
  findAuthor(request: Request, response: Response): Promise<ControllerResponse>;
  findAuthors(request: Request, response: Response): Promise<ControllerResponse>;
  updateAuthor(request: Request, response: Response): Promise<ControllerResponse>;
  deleteAuthor(request: Request, response: Response): Promise<ControllerResponse>;
}
