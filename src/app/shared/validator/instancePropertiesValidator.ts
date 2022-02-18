import { validateSync } from 'class-validator';
import { ValidationError } from './errors';

export class InstancePropertiesValidator {
  public static validate(objInstance: Record<string, unknown>): void {
    const validationErrors = validateSync(objInstance, { whitelist: true });

    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors);
    }
  }
}
