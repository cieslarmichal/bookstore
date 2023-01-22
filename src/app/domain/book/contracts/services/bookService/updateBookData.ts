import { IsNumber, IsOptional, IsString } from 'class-validator';

import { Validator } from '../../../../../common/validator/validator';

export class UpdateBookData {
  @IsString()
  @IsOptional()
  public description?: string;

  @IsNumber()
  @IsOptional()
  public price?: number;

  public constructor({ description, price }: UpdateBookData) {
    if (description) {
      this.description = description;
    }

    if (price) {
      this.price = price;
    }

    Validator.validate(this);
  }
}
