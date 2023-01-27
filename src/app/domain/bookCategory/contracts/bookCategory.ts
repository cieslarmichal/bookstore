import { IsUUID } from 'class-validator';

import { Validator } from '../../../common/validator/validator';

export class BookCategory {
  @IsUUID('4')
  public readonly id: string;

  @IsUUID('4')
  public bookId: string;

  @IsUUID('4')
  public categoryId: string;

  public constructor({ id, bookId, categoryId }: BookCategory) {
    this.id = id;
    this.bookId = bookId;
    this.categoryId = categoryId;

    Validator.validate(this);
  }
}
