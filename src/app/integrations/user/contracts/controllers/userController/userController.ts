import { Request, Response } from 'express';
import { ControllerResponse } from '../../../../controllerResponse';

export interface UserController {
  registerUser(request: Request, response: Response): Promise<ControllerResponse>;
  loginUser(request: Request, response: Response): Promise<ControllerResponse>;
  setUserPassword(request: Request, response: Response): Promise<ControllerResponse>;
  setUserPhoneNumber(request: Request, response: Response): Promise<ControllerResponse>;
  setUserEmail(request: Request, response: Response): Promise<ControllerResponse>;
  findUser(request: Request, response: Response): Promise<ControllerResponse>;
  deleteUser(request: Request, response: Response): Promise<ControllerResponse>;
}
