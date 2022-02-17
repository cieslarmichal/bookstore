import Joi from 'joi';
import { Service } from 'typedi';
import { Request } from 'express';

export class ValidationError {
  constructor(public error: string) {}
}

@Service()
export class BookRequestValidator {
  checkForValidationErrorInCreateBookRequest(
    req: Request,
  ): ValidationError | null {
    const schema = Joi.object().keys({
      title: Joi.string().required(),
      author: Joi.string().required(),
      releaseYear: Joi.number().required(),
      language: Joi.string().required(),
      format: Joi.string().required(),
      description: Joi.string().optional(),
      price: Joi.number().required(),
    });

    const { error } = schema.validate(req);

    if (error) {
      return new ValidationError(error.details[0].message);
    }

    return null;
  }

  checkForValidationErrorInUpdateBookRequest(
    req: Request,
  ): ValidationError | null {
    const schema = Joi.object().keys({
      description: Joi.string().optional(),
      price: Joi.number().required(),
    });

    const { error } = schema.validate(req);

    if (error) {
      return new ValidationError(error.details[0].message);
    }

    return null;
  }
}
