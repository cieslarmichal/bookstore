import { ClassConstructor, plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ValidationError } from './errors';

export class ClassFromRecordValidator {
  public static validateDto<T extends ClassConstructor<any>>(
    classConstructor: T,
    record: Record<string, unknown>,
  ) {
    const objInstance = plainToClass(classConstructor, record);

    const validationErrors = validateSync(objInstance, { whitelist: true });

    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors);
    }

    return objInstance;
  }
}
