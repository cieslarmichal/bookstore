import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../common/transformer/recordToInstanceTransformer';

export class Address {
  @IsUUID('4')
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsString()
  public readonly firstName: string;

  @IsString()
  public readonly lastName: string;

  @IsString()
  public readonly phoneNumber: string;

  @IsString()
  public readonly country: string;

  @IsString()
  public readonly state: string;

  @IsString()
  public readonly city: string;

  @IsString()
  public readonly zipCode: string;

  @IsString()
  public readonly streetAddress: string;

  @IsOptional()
  @IsString()
  public readonly deliveryInstructions?: string | undefined;

  @IsOptional()
  @IsUUID('4')
  public readonly customerId: string;

  public static readonly create = RecordToInstanceTransformer.transformFactory(Address);
}
