import { plainToInstance } from 'class-transformer';
import { InstanceValidator } from '../validator';

export class RecordToInstanceTransformer {
  public static transform<T>(
    Constructor: new () => T,
    record: Record<any, any>,
  ): T {
    const instance = plainToInstance(Constructor, record);

    InstanceValidator.validate<T>(instance);

    return instance;
  }

  public static transformFactory<T>(Constructor: new () => T) {
    return (properties: Partial<T>) =>
      RecordToInstanceTransformer.transform<T>(Constructor, properties);
  }
}
