import { IsOptional, IsUUID } from 'class-validator';

import { Validator } from '../../../../../common/validator/validator';

export class FindCustomerData {
  @IsOptional()
  @IsUUID('4')
  public readonly id?: string;

  @IsOptional()
  @IsUUID('4')
  public readonly userId?: string;

  public constructor({ id, userId }: FindCustomerData) {
    if (id) {
      this.id = id;
    }

    if (userId) {
      this.userId = userId;
    }

    Validator.validate(this);
  }
}
