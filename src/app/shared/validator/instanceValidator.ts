import { validateSync } from 'class-validator';
import { ValidationError } from './errors';

export class InstanceValidator {
  public static validate<T>(objInstance: T): void {
    const validationErrors = validateSync(objInstance as any, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (validationErrors.length > 0) {
      throw new ValidationError();
    }
  }
}
