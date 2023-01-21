import { validateSync } from 'class-validator';

import { ValidationError } from './errors/validationError.js';

export class Validator {
  public static validate<T extends object>(instance: T): void {
    const errors = validateSync(instance, {
      stopAtFirstError: true,
      forbidUnknownValues: true,
      whitelist: true,
    });

    if (!errors.length || !errors[0]) {
      return;
    }

    const { target, constraints, property, value } = errors[0];

    throw new ValidationError({
      target,
      property,
      value,
      constraints: constraints || {},
    });
  }
}
