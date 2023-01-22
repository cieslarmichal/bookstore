import { IsDate, IsString, IsUUID } from 'class-validator';

import { Validator } from '../../../common/validator/validator';

export class Category {
  @IsUUID('4')
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsString()
  public readonly name: string;

  public constructor({ id, createdAt, updatedAt, name }: Category) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.name = name;

    Validator.validate(this);
  }
}
