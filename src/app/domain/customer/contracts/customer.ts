import { IsUUID } from 'class-validator';

import { Validator } from '../../../common/validator/validator';

export class Customer {
  @IsUUID('4')
  public readonly id: string;

  @IsUUID('4')
  public readonly userId: string;

  public constructor({ id, userId }: Customer) {
    this.id = id;
    this.userId = userId;

    Validator.validate(this);
  }
}
