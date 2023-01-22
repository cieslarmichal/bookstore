import { IsString, IsUUID } from 'class-validator';

import { Validator } from '../../../../../common/validator/validator';

export class CreateBookCategoryData {
  @IsString()
  @IsUUID('4')
  public bookId: string;

  @IsString()
  @IsUUID('4')
  public categoryId: string;

  public constructor({ bookId, categoryId }: CreateBookCategoryData) {
    this.bookId = bookId;
    this.categoryId = categoryId;

    Validator.validate(this);
  }
}
