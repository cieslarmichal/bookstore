import { Request, Response } from 'express';
import { ControllerResponse } from '../../../../controllerResponse';

export interface BookController {
  createBook(request: Request, response: Response): Promise<ControllerResponse>;
  findBook(request: Request, response: Response): Promise<ControllerResponse>;
  findBooks(request: Request, response: Response): Promise<ControllerResponse>;
  updateBook(request: Request, response: Response): Promise<ControllerResponse>;
  deleteBook(request: Request, response: Response): Promise<ControllerResponse>;
}
