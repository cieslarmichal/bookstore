import { IsString, IsUUID } from 'class-validator';

import { Validator } from '../../../common/validator/validator';

export class Category {
  @IsUUID('4')
  public readonly id: string;

  @IsString()
  public readonly name: string;

  public constructor({ id, name }: Category) {
    this.id = id;
    this.name = name;

    Validator.validate(this);
  }
}
