import { IsDate, IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../common/transformer/recordToInstanceTransformer';

export class Customer {
  @IsUUID('4')
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsUUID('4')
  public readonly userId: string;

  public static readonly create = RecordToInstanceTransformer.transformFactory(Customer);
}
