import { IsString } from 'class-validator';

import { Validator } from '../../../../../common/validator/validator';

export class CreateCategoryData {
  @IsString()
  public name: string;

  public constructor({ name }: CreateCategoryData) {
    this.name = name;

    Validator.validate(this);
  }
}
