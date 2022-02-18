import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import * as express from 'express';
import { HttpException } from '../exceptions/httpException';

export function validationMiddleware(type: any): express.RequestHandler {
  return async (req, res, next) => {
    const errors = await validate(plainToInstance(type, req.body));
    if (errors.length > 0) {
      const message = errors
        .map((error: ValidationError) => Object.values(error.constraints))
        .join(', ');
      next(new HttpException(400, message));
    } else {
      next();
    }
  };
}
