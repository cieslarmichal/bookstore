import { IsDate, IsString, IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../shared';

export class AddressDto {
  @IsUUID('4')
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsString()
  public readonly fullName: string;

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

  public static readonly create = RecordToInstanceTransformer.transformFactory(AddressDto);
}
