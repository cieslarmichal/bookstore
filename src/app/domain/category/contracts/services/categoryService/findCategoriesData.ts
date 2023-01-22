import { IsOptional } from 'class-validator';

import { Validator } from '../../../../../common/validator/validator';
import { FilterProperty } from '../../../../common/filterProperty';

export class FindCategoriesData {
  @IsOptional()
  public readonly name?: FilterProperty;

  public constructor({ name }: FindCategoriesData) {
    if (name) {
      this.name = name;
    }

    Validator.validate(this);
  }
}
