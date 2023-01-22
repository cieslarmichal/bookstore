import { Request, Response } from 'express';

import { ControllerResponse } from '../../../../controllerResponse';

export interface CustomerController {
  createCustomer(request: Request, response: Response): Promise<ControllerResponse>;
  findCustomer(request: Request, response: Response): Promise<ControllerResponse>;
  deleteCustomer(request: Request, response: Response): Promise<ControllerResponse>;
}
