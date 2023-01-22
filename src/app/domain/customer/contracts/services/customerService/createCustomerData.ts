import { IsUUID } from 'class-validator';

import { Validator } from '../../../../../common/validator/validator';

export class CreateCustomerData {
  @IsUUID('4')
  public readonly userId: string;

  public constructor({ userId }: CreateCustomerData) {
    this.userId = userId;

    Validator.validate(this);
  }
}
