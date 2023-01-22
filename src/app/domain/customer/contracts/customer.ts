import { IsDate, IsUUID } from 'class-validator';

import { Validator } from '../../../common/validator/validator';

export class Customer {
  @IsUUID('4')
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsUUID('4')
  public readonly userId: string;

  public constructor({ id, createdAt, updatedAt, userId }: Customer) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.userId = userId;

    Validator.validate(this);
  }
}
