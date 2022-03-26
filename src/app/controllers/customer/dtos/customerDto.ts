import { IsDate, IsOptional, IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../shared';

export class CustomerDto {
  @IsUUID('4')
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsOptional()
  @IsUUID('4')
  public readonly userId: string;

  public static readonly create = RecordToInstanceTransformer.transformFactory(CustomerDto);
}
