import { IsOptional, IsUUID } from 'class-validator';

export class FindCustomerData {
  @IsOptional()
  @IsUUID('4')
  public readonly id?: string;

  @IsOptional()
  @IsUUID('4')
  public readonly userId?: string;
}
