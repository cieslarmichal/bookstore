import { IsString, IsUUID } from 'class-validator';

import { Validator } from '../../../../../common/validator/validator';

export class RemoveBookCategoryData {
  @IsString()
  @IsUUID('4')
  public bookId: string;

  @IsString()
  @IsUUID('4')
  public categoryId: string;

  public constructor({ bookId, categoryId }: RemoveBookCategoryData) {
    this.bookId = bookId;
    this.categoryId = categoryId;

    Validator.validate(this);
  }
}
