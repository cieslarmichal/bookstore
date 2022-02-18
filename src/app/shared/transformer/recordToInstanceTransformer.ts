import { ClassConstructor, plainToInstance } from 'class-transformer';
import { InstancePropertiesValidator } from '../validator';

export class RecordToInstanceTransformer {
  public static transform<T extends ClassConstructor<any>>(
    classConstructor: T,
    record: Record<string, unknown>,
  ) {
    const instance = plainToInstance(classConstructor, record);

    InstancePropertiesValidator.validate(instance);

    return instance;
  }

  public static transformFactory<T extends ClassConstructor<any>>(
    classConstructor: T,
  ) {
    return (properties: Partial<T>) =>
      RecordToInstanceTransformer.transform<T>(classConstructor, properties);
  }
}
