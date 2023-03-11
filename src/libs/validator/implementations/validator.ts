import { Schema } from 'zod';

import { ValidationError } from '../errors/validationError';

export class Validator {
  public static validate<T>(schema: Schema<T>, input: T): T {
    const result = schema.safeParse(input);

    if (!result.success) {
      throw new ValidationError({
        message: result.error.message,
        issues: result.error.issues,
        target: input,
      });
    }

    return result.data;
  }
}
