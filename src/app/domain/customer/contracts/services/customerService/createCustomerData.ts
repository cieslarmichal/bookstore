import { IsUUID } from 'class-validator';

export class CreateCustomerData {
  @IsUUID('4')
  public readonly userId: string;
}
