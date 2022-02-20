import { plainToInstance } from 'class-transformer';
import { InstanceValidator } from '../validator';

export class RecordToInstanceTransformer {
  public static transform<T>(record: Record<any, any>, Constructor: new () => T): T {
    const instance = plainToInstance(Constructor, record);

    InstanceValidator.validate<T>(instance);

    return instance;
  }

  public static transformFactory<T>(Constructor: new () => T) {
    return (properties: Partial<T>) => RecordToInstanceTransformer.transform<T>(properties, Constructor);
  }
}
